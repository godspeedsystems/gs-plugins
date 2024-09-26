import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, logger } from "@godspeedsystems/core";
import express from "express";
import bodyParser from 'body-parser';
import promClient from '@godspeedsystems/metrics';
import cors from 'cors';
//@ts-ignore
import promMid from '@godspeedsystems/express-prometheus-middleware';
import passport from "passport";
import fileUpload from "express-fileupload";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import session from 'express-session';

export default class EventSource extends GSEventSource {
  
  // Initialize express and middleware
  async initClient(): Promise<PlainObject> {
    const app = express();
    const {
      port = 3000,
      request_body_limit = '50mb',
      file_size_limit = '50mb',
    } = this.config;

    this.setupMiddleware(app);
    this.setupAuthentication(app);

    // Start the Express server
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    if (process.env.OTEL_ENABLED === 'true') {
      this.setupMetrics(app);
    }

    return app;
  }

  // Modularized middleware setup
  setupMiddleware(app: express.Express) {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true, limit: this.config.request_body_limit || '50mb' }));
    app.use(bodyParser.json({ limit: this.config.file_size_limit || '50mb' }));
    app.use(fileUpload({ useTempFiles: true, limits: { fileSize: this.config.file_size_limit || '50mb' }, abortOnLimit: true }));
    
    // Session middleware setup if required
    if (this.config.session) {
      app.use(session({
        secret: this.config.session.secret || 'defaultsecret',
        resave: false,
        saveUninitialized: false,
      }));
    }
  }

  // Modularized authentication setup
  setupAuthentication(app: express.Express) {
    const jwtConfig = this.config.authn?.jwt || this.config.jwt;
    const githubConfig = this.config.authn?.oauth2?.github || this.config.oauth2?.github;
    const linkedinConfig = this.config.authn?.oauth2?.linkedin || this.config.oauth2?.linkedin;

    if (jwtConfig) {
      this.setupJwtAuthentication(app, jwtConfig);
    }

    if (githubConfig) {
      this.setupGithubAuthentication(app, githubConfig);
    }
    if (linkedinConfig) {
      this.setupLinkedInAuthentication(app, linkedinConfig);
    }
  }

  setupJwtAuthentication(app: express.Express, jwtConfig: PlainObject) {
    if (!jwtConfig.secretOrKey || !jwtConfig.audience || !jwtConfig.issuer) {
      logger.fatal('JWT configuration error. Exiting');
      process.exit(1);
    }
    app.use(passport.initialize());
    passport.use(new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfig.secretOrKey,
        ignoreExpiration: true,
        jsonWebTokenOptions: {
          audience: jwtConfig.audience,
          issuer: jwtConfig.issuer,
        },
      },
      (jwtPayload, done) => done(null, jwtPayload),
    ));
  }
  setupLinkedInAuthentication(app: express.Express, linkedinConfig: PlainObject) {
    if (!linkedinConfig.client_id || !linkedinConfig.client_secret || !linkedinConfig.callback_url) {
      logger.fatal('LinkedIn configuration error. Exiting');
      process.exit(1);
    }

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LinkedInStrategy(
      {
        clientID: linkedinConfig.client_id,
        clientSecret: linkedinConfig.client_secret,
        callbackURL: linkedinConfig.callback_url,
        scope: linkedinConfig.scope || ['r_emailaddress', 'r_liteprofile']
      },
      (accessToken:any, refreshToken:any, profile:any, done:any) => done(null, profile),
    ));

    // LinkedIn Authentication Routes
    app.get('/auth/linkedin', passport.authenticate('linkedin'));

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj:any, done) => done(null, obj));
  }
  setupGithubAuthentication(app: express.Express, githubConfig: PlainObject) {
    if (!githubConfig.client_id || !githubConfig.client_secret || !githubConfig.callback_url) {
      logger.fatal('Github configuration error. Exiting');
      process.exit(1);
    }

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new GithubStrategy(
      {
        clientID: githubConfig.client_id,
        clientSecret: githubConfig.client_secret,
        callbackURL: githubConfig.callback_url,
        scope: ['user:email'],
      },
      (accessToken:any, refreshToken:any, profile:any, done: any) => {
        const pro = {
          "accessToken" : accessToken,
          "refresh": refreshToken,
          "profile" : profile
        }
        done(null, profile)
      },
    ));

    // Authentication routes
    app.get('/auth/github', passport.authenticate('github', { session: true, scope: ['user:email'] }));
    app.get('/auth/github/callback', passport.authenticate('github'), (req, res) => {
      res.redirect('/verify/user');
    });

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj:any, done) => done(null, obj));
  }

  // Setup OpenTelemetry metrics
  setupMetrics(app: express.Express) {
    app.use(promMid({
      metricsPath: false,
      collectDefaultMetrics: true,
      requestDurationBuckets: promClient.exponentialBuckets(0.2, 3, 6),
      requestLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
      responseLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
    }));
  }

  // Auth middleware as higher-order function
  private authnHOF(authn: boolean) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (authn && (this.config.authn?.jwt || this.config.authn)) {
        return passport.authenticate('jwt', { session: false })(req, res, next);
      } else {
        next();
      }
    };
  }

  // Subscribe to events with flexibility
  subscribeToEvent(eventRoute: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event?: PlainObject): Promise<void> {
    const routeSplit = eventRoute.split('.');
    const httpMethod: string = routeSplit[1];
    let endpoint = routeSplit[2].replace(/{(.*?)}/g, ':$1');
    let baseUrl = this.config.base_url;
    let fullUrl;
    if (baseUrl) {
      fullUrl = "/" + baseUrl + "/" + endpoint;
      fullUrl = fullUrl.replace(/\/\//g, '/');
    } else {
      fullUrl = endpoint;
    }

    const app: express.Express = this.client as express.Express;
    //@ts-ignore
    app[httpMethod](fullUrl, this.authnHOF(event.authn), async (req: express.Request, res: express.Response) => {
      const gsEvent: GSCloudEvent = this.createGSEvent(req, endpoint)
      const status: GSStatus = await processEvent(gsEvent, { key: eventRoute, ...eventConfig });
      res
        .status(status.code || 200)
        // if data is a integer, it takes it as statusCode, so explicitly converting it to string
        .send(Number.isInteger(status.data) ? String(status.data) : status.data);
    });
    return Promise.resolve();
  }

  // Utility to create GSEvent from request
  private createGSEvent(req: express.Request, endpoint: string): GSCloudEvent {
    const reqData = { ...this.omit(req, ['_readableState', 'socket', 'client', '_parsedUrl', 'res', 'app']), ...this.pick(req, ['headers']) };
    return new GSCloudEvent('id', endpoint, new Date(), 'http', '1.0', reqData, 'REST', new GSActor('user'), {});
  }

  // Omit and pick utilities
  private pick(obj: PlainObject, keys: string[]): PlainObject {
    const result: any = {};
    keys.forEach(key => { result[key] = obj[key]; });
    return result;
  }

  private omit(obj: PlainObject, keys: string[]): PlainObject {
    const result = { ...obj };
    keys.forEach(key => { delete result[key]; });
    return result;
  }
}

const SourceType = 'ES';
const Type = 'express';
const CONFIG_FILE_NAME = 'http';
const DEFAULT_CONFIG = { port: 3000, docs: { endpoint: '/api-docs' } };

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};
