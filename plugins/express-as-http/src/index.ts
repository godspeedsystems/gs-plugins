import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, logger } from "@godspeedsystems/core";
import express from "express";
import bodyParser from 'body-parser';
import promClient from '@godspeedsystems/metrics';
import cors from 'cors';
//@ts-ignore
import promMid from '@godspeedsystems/express-prometheus-middleware';
import passport from "passport";
const session = require('express-session');
import fileUpload from "express-fileupload";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';

export default class EventSource extends GSEventSource {
  async initClient(): Promise<PlainObject> {
    const app = express();
    const { port = 3000, docs = { endpoint: '/api-docs' } } = this.config;


    this.setupMiddleware(app);
    this.setupAuthentication(app);
    // Start the Express server
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Try it out at: http://localhost:${port}${docs.endpoint}`);

    });
    if (process.env.OTEL_ENABLED === 'true') {
      this.setupMetrics(app);
    }
    return app;
  }
  setupMiddleware(app: express.Express) {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true, limit: this.config.request_body_limit || '50mb' }));
    app.use(bodyParser.json({ limit: this.config.file_size_limit || '50mb' }));
    app.use(fileUpload({ useTempFiles: true, limits: { fileSize: this.config.file_size_limit || '50mb' }, abortOnLimit: true }));

    app.use(session({
      secret: this.config.session?.secret || 'mysecret',
      resave: false,
      saveUninitialized: false
    }));
  }

  setupAuthentication(app: express.Express) {
    const jwtConfig = this.config.authn?.jwt || this.config.jwt;
    const githubConfig = this.config.authn?.oauth2?.github;
    const googleConfig = this.config.authn?.oauth2?.google;
    const linkedinConfig = this.config.authn?.oauth2?.linkedin;

    if (jwtConfig) {
      this.setupJwtAuthentication(app, jwtConfig);
    }
    if (googleConfig) {
      this.setupGoogleAuthentication(app, googleConfig);
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
    app.use(passport.session());
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

  setupGoogleAuthentication(app: express.Express, googleConfig: PlainObject) {

    if (!googleConfig.client_id || !googleConfig.client_secret || !googleConfig.callback_url) {
      logger.fatal('Google configuration error. Exiting');
      process.exit(1);
    }
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(
      new GoogleStrategy({
        clientID: googleConfig.client_id,
        clientSecret: googleConfig.client_secret,
        callbackURL: googleConfig.callback_url,
        passReqToCallback: true // Enable this option
      },
        async function (req: any, accessToken: any, refreshToken: any, profile: any, done: any) {
          logger.info("******", profile);  
          return done(null, profile);
        })
    );
    const authRoute = googleConfig.auth_route || '/auth/google'; 
    const callbackRoute = googleConfig.callback_route || '/auth/google/callback' ;
    const failureRedirectURL = googleConfig.failure_redirect || '/error'  ;
    const successRedirectURL = googleConfig.success_redirect || '/verify/user'  ;
    // ***************Authentication routes *********************
    app.get(authRoute, passport.authenticate('google', { scope: ['email', 'profile'] }), (req, res) => {
    });
    app.get(callbackRoute, passport.authenticate('google'),
      async (req, res) => {
        res.redirect(successRedirectURL);
      }
    );
    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (obj: any, done) {
      done(null, obj);
    });
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
        scope: linkedinConfig.scope || ['openid', 'email', 'profile'],
        // state: true
      },
      (accessToken: any, refreshToken: any, profile: any, done: any) => done(null, profile),
    ));
    const authRoute = linkedinConfig.auth_route || '/auth/linkedin'; 
    const callbackRoute = linkedinConfig.callback_route || '/auth/linkedin/callback' ;
    const failureRedirectURL = linkedinConfig.failure_redirect || '/error'  ;
    const successRedirectURL = linkedinConfig.success_redirect || '/verify/user'  ;
    // LinkedIn Authentication Routes
    app.get(authRoute, passport.authenticate('linkedin'));

    app.get(callbackRoute, passport.authenticate('linkedin',{failureRedirect: failureRedirectURL}), (req, res) => {
   
      res.redirect(successRedirectURL);
    });

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj: any, done) => done(null, obj));
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
        scope: ['user:email']
      },
      (accessToken: any, refreshToken: any, profile: any, done: any) => {
        const pro = {
          "accessToken": accessToken,
          "refresh": refreshToken,
          "profile": profile
        }
        done(null, profile)
      },
    ));
    const authRoute = githubConfig.auth_route || '/auth/github'; 
    const callbackRoute = githubConfig.callback_route || '/auth/github/callback' ;
    const failureRedirectURL = githubConfig.failure_redirect || '/error'  ;
    const successRedirectURL = githubConfig.success_redirect || '/verify/user'  ;

   // ************* Authentication routes GITHUB  ******************
    app.get(authRoute, passport.authenticate('github', {session: true, scope: ['user:email'] }));
  
    app.get(callbackRoute, passport.authenticate('github',{failureRedirect: failureRedirectURL}),async (req, res) => {
        res.redirect(successRedirectURL);
    });

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj: any, done) => done(null, obj));
  }
 
  // Setup OpenTelemetry metrics
  // setupMetrics(app: express.Express) {
  // const { metrics } = this.config;
  
  // // Validation function
  // const validateBuckets = (buckets: any, name: string): number[] | null => {
  //   if (!buckets) return null;
  //   if (!Array.isArray(buckets)) {
  //     throw new Error(`${name} must be an array of numbers`);
  //   }
  //   if (!buckets.every(bucket => typeof bucket === 'number' && !isNaN(bucket))) {
  //     throw new Error(`${name} must contain only valid numbers`);
  //   }
  //   return buckets;
  // };
  // // Validate the three bucket configurations
  // const requestDurationBuckets = validateBuckets(metrics?.requestDurationBuckets, 'requestDurationBuckets') 
  //                               || promClient.exponentialBuckets(0.2, 3, 6);
  
  // const requestLengthBuckets = validateBuckets(metrics?.requestLengthBuckets, 'requestLengthBuckets')
  //                               || promClient.exponentialBuckets(512, 2, 10);
  
  // const responseLengthBuckets = validateBuckets(metrics?.responseLengthBuckets, 'responseLengthBuckets')
  //                               || promClient.exponentialBuckets(512, 2, 10);

  //   app.use(promMid({
  //     metricsPath: '/metrics',
  //     collectDefaultMetrics: true,
  //     requestDurationBuckets,
  //     requestLengthBuckets,
  //     responseLengthBuckets,
  //   }));
  // }

  
// Setup OpenTelemetry metrics
setupMetrics(app: express.Express) {
  const { metrics } = this.config;
  // Validation helper
  const validateBuckets = (buckets: any, name: string) => {
    if (!buckets) return null;
    if (!Array.isArray(buckets) || !buckets.every(b => typeof b === 'number' && !isNaN(b))) {
      throw new Error(`${name} must be an array of numbers`);
    }
    return buckets;
  };

  app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: validateBuckets(metrics?.requestDurationBuckets, 'requestDurationBuckets') 
                           || promClient.exponentialBuckets(0.2, 3, 6),
    requestLengthBuckets: validateBuckets(metrics?.requestLengthBuckets, 'requestLengthBuckets')
                         || promClient.exponentialBuckets(512, 2, 10),
    responseLengthBuckets: validateBuckets(metrics?.responseLengthBuckets, 'responseLengthBuckets')
                          || promClient.exponentialBuckets(512, 2, 10),
  }));
}
  private authnHOF(authn: boolean) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (authn !== false && (this.config.authn?.jwt || this.config.authn)) {
        return passport.authenticate('jwt', { session: false })(req, res, next)
      }
      if (authn !== false && (this.config.authn?.oauth2 || this.config.authn?.oauth2?.google)) {
        req.user ? next() : res.sendStatus(401)
        return passport.authenticate('google', { scope: ['email', 'profile'] });
      }
      else {
        next();
      }
    };
  };
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
      const gsEvent: GSCloudEvent = createGSEvent(req, endpoint)
      const status: GSStatus = await processEvent(gsEvent, { key: eventRoute, ...eventConfig });
      if (status.code && status.code === 302 && status.data?.redirectUrl) {
        res.redirect(302, status.data.redirectUrl);
      } else {
      res
        .status(status.code || 200)
        // if data is a integer, it takes it as statusCode, so explicitly converting it to string
        .send(Number.isInteger(status.data) ? String(status.data) : status.data);
      }
    });
    return Promise.resolve();
  }
}
// Remove leading and trailing / (slash) if present
function trimSlashes(endpoint: string) {
  if (endpoint[0] === '/') {
    endpoint = endpoint.substring(1);
  }
  if (endpoint[endpoint.length - 1] === '/') {
    endpoint = endpoint.substring(0, endpoint.length - 1);
  }
  return endpoint;
}
function createGSEvent(req: express.Request, endpoint: string) {
  const reqProp = omit(req, [
    '_readableState',
    'socket',
    'client',
    '_parsedUrl',
    'res',
    'app'
  ]);
  const reqHeaders = pick(req, ['headers']);
  let data = { ...reqProp, ...reqHeaders };

  const event: GSCloudEvent = new GSCloudEvent(
    'id',
    endpoint,
    new Date(),
    'http',
    '1.0',
    data,
    'REST',
    new GSActor('user'),
    {}
  );

  return event;
}

function pick(o: PlainObject, keys: string[]): PlainObject {
  let newObj: PlainObject = {};
  for (let key of keys) {
    newObj[key] = o[key];
  }
  return newObj; //return new copy
}

function omit(o: PlainObject, keys: string[]): PlainObject {
  o = { ...o }; //shallow clone
  for (let key of keys) {
    delete o[key];
  }
  return o; //return new copy
}

const SourceType = 'ES';
const Type = 'express'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'http'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = { port: 3000, docs: { endpoint: '/api-docs' } };

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};