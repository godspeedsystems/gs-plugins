import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource } from "@godspeedsystems/core";
import express from "express";
import bodyParser from 'body-parser';
import promClient from '@godspeedsystems/metrics';
//@ts-ignore
import promMid from '@mindgrep/express-prometheus-middleware';
import passport from "passport";
import fileUpload from "express-fileupload"
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

export default class EventSource extends GSEventSource {
  async initClient(): Promise<PlainObject> {
    const app = express();
    const {
      port = 3000,
      request_body_limit = 50 * 1024 * 1024,
      file_size_limit = 50 * 1024 * 1024,
      jwt: jwtConfig,
    } = this.config;

    app.use(bodyParser.urlencoded({ extended: true, limit: request_body_limit }));
    app.use(bodyParser.json({ limit: file_size_limit }));
    app.use(
      fileUpload({
        useTempFiles: true,
        //@ts-ignore
        limits: { fileSize: file_size_limit },
        abortOnLimit:true,
      })
    );
  
    if (jwtConfig) {
      if (!jwtConfig.secretOrKey || !jwtConfig.audience || !jwtConfig.issuer) {
        throw new Error('Check all three JWT values are set properly for Express HTTP event source: secretOrKey, audience or issuer. Exiting');
      }
      app.use(passport.initialize());
      passport.use(
        new JwtStrategy(
          {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfig.secretOrKey,
            ignoreExpiration: true,
            jsonWebTokenOptions: {
              audience: jwtConfig.audience,
              issuer: jwtConfig.issuer,
            },
          },
          function (jwtPayload, done) {
            return done(null, jwtPayload);
          },
        ),
      );
    };

    app.listen(port);

    if (process.env.OTEL_ENABLED == 'true') {
      app.use(
        promMid({
          metricsPath: false,
          collectDefaultMetrics: true,
          requestDurationBuckets: promClient.exponentialBuckets(0.2, 3, 6),
          requestLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
          responseLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
        })
      );
    }

    return app;
  }

  private authnHOF(authn: boolean) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (authn) {
        return passport.authenticate('jwt', { session: false })(req, res, next)
      } else {
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
      // if (endpoint[0] === '/') {
      //   endpoint = endpoint.substring(1);
      // }
      // endpoint = endpoint.replace(/^\//,''); //remove trailing ./
      // baseUrl = trimSlashes(baseUrl);
      // baseUrl = baseUrl.replace(/^\//,''); //remove starting /
      // baseUrl = baseUrl.replace(/^\//,''); //remove starting /
      fullUrl = "/" + baseUrl  + "/" + endpoint;
      fullUrl = fullUrl.replace(/\/\//g, '/');
    }
    
    const app: express.Express = this.client as express.Express;
    //@ts-ignore
    app[httpMethod](fullUrl, this.authnHOF(event.authn), async (req: express.Request, res: express.Response) => {
      const gsEvent: GSCloudEvent = createGSEvent(req, endpoint)
      const status: GSStatus = await processEvent(gsEvent, { key: eventRoute, ...eventConfig });
      res
        .status(status.code || 200)
        // if data is a integer, it takes it as statusCode, so explicitly converting it to string
        .send(Number.isInteger(status.data) ? String(status.data) : status.data);
    });
    return Promise.resolve();
  }

}
// Remove leading and trailing / (slash) if present
function trimSlashes(endpoint: string) {
  if (endpoint[0] === '/') {
    endpoint = endpoint.substring(1);
  }
  if (endpoint[endpoint.length -1] === '/') {
    endpoint = endpoint.substring(0, endpoint.length -1);
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

function pick (o:PlainObject, keys:string[]): PlainObject {
  let newObj:PlainObject = {};
  for (let key of keys) {
    newObj[key] = o[key];
  }
  return newObj; //return new copy
}

function omit (o:PlainObject, keys:string[]): PlainObject {
  o = {...o}; //shallow clone
  for (let key of keys) {
    delete o[key];
  }
  return o; //return new copy
}

const SourceType = 'ES';
const Type = 'express'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'http'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = { port: 3000, docs: { endpoint: '/api-docs' } };

export  {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};