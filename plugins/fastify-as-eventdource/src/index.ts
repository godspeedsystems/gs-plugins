import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource } from "@godspeedsystems/core";
import fastify, {FastifyReply, FastifyRequest, HTTPMethods} from "fastify";
import fastifyFormBody from '@fastify/formbody';
//@ts-ignore
import fastifySwaggerUI from "fastify-swagger-ui";
import fastifyCors from '@fastify/cors';
import fastifyExpress from "@fastify/express";
import promClient from '@godspeedsystems/metrics';
//@ts-ignore
import promMid from '@mindgrep/express-prometheus-middleware';
import _ from "lodash";
import fastifyJWT from "@fastify/jwt";
import qs from "qs";

class EventSource extends GSEventSource {
  protected async initClient(): Promise<PlainObject> {
    const fastifyApp = fastify();
    const {
      request_body_limit = 50 * 1024 * 1024,
      jwt: jwtConfig,
      port = 3000,
      docs
    } = this.config;

    fastifyApp.register(fastifyFormBody,{
      bodyLimit: request_body_limit,
      parser: str => qs.parse(str)
    });

    fastifyApp.register(fastifyCors,{
      origin: `http://localhost:${port}${docs?.endpoint}`,
      methods: ['GET', 'POST', 'PUT','DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      credentials: true,
      maxAge: 600,
      preflightContinue: true,
      optionsSuccessStatus: 204
    });

    fastifyApp.register(fastifyExpress);

    if(docs?.endpoint){
      fastifyApp.register(fastifySwaggerUI,{
        swagger: {
          info: {
            title: 'Project Documentation',
            description: 'Project Backend Documentation',
            version: '1.0.0'
          },
          host: `localhost:${port}`,
          basePath: '/',
          schemes: ['http'],
          consumes: ['application/json'],
          produces: ['application/json'],
        },
        exposeRoute: true 
      });
    }


    if (jwtConfig) {
      fastifyApp.register(fastifyJWT, {
        secret: jwtConfig.secretOrKey,
        decode: { complete: true },
        sign: {
          iss: jwtConfig.issuer,
          aud: jwtConfig.audience,
        },
        verify: {
          allowedIss: jwtConfig.issuer,
          allowedAud: jwtConfig.audience
        }
      });
    };

    if (process.env.OTEL_ENABLED == 'true') {
      fastifyApp.express.use(promMid({
          metricsPath: false,
          collectDefaultMetrics: true,
          requestDurationBuckets: promClient.exponentialBuckets(0.2, 3, 6),
          requestLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
          responseLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
      }))
    }
    
    return fastifyApp;
  }

  private authnHOF(authn: boolean) {
    return async (request:FastifyRequest, reply:FastifyReply) => {
      if (authn) {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply
            .code(401)
            .send({ error: 'Unauthorized', message: 'Invalid token' });
          return;
        }
      }
    };
  };

  async subscribeToEvent(eventRoute: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event?: PlainObject): Promise<void> {
    const routeSplit = eventRoute.split('.');
    const httpMethod: string = routeSplit[1];
    const endpoint = routeSplit[2].replace(/{(.*?)}/g, ':$1');
    const fastifyApp = this.client;
    const {port} = this.config;

    if(fastifyApp){
      fastifyApp.route({
        method: httpMethod as HTTPMethods,
        url: endpoint,
        schema: {
          summary: eventConfig.summary,
          description: eventConfig.description,
          requestBody: eventConfig.body,
          parameters: eventConfig.params,
          responses: eventConfig.responses,
          security: eventConfig.authn && [
            {
              api_key: []
            }
          ]
        },
        preHandler: this.authnHOF(event?.authn),
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          const gsEvent: GSCloudEvent = EventSource.createGSEvent(request, endpoint);
          const status: GSStatus = await processEvent(gsEvent, { key: eventRoute, ...eventConfig });
          reply
            .code(status.code || 200)
            .send(Number.isInteger(status.data) ? String(status.data) : status.data);
        },
      });

      fastifyApp.listen({port});
      
      return Promise.resolve();
    }
    return Promise.reject();
  }

  static createGSEvent(request: FastifyRequest, endpoint: string) {
    const reqProp = _.omit(request, ['_readableState','socket','client','_parsedUrl','res','app']);
    const reqHeaders = _.pick(request, ['headers']);
    let data = { ...reqProp, ...reqHeaders };

    const event: GSCloudEvent = new GSCloudEvent('id', endpoint, new Date(), 'http', '1.0', data, 'REST', new GSActor('user'), {});
    return event;
  }

}

const SourceType = 'ES';
const Type = "fastify"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "fastify"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
