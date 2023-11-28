import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource } from "@godspeedsystems/core";
import fastify, {FastifyReply, FastifyRequest, HTTPMethods} from "fastify";
import fastifyFormBody from '@fastify/formbody';
//@ts-ignore
import fastifySwaggerUI from "fastify-swagger-ui";
import fastifyCors from '@fastify/cors';
import fastifyExpress from "@fastify/express";
//@ts-ignore
import promMid from '@mindgrep/express-prometheus-middleware';
import promClient from '@godspeedsystems/metrics';
import fastifyJWT from "@fastify/jwt";
import qs from "qs";

class FastifyEventSource extends GSEventSource {
  // Create a new Fastify instance
  async initClient(): Promise<PlainObject> {
    const fastifyApp = fastify();

    // Destructure configuration options or set default values
    const {
      request_body_limit = 50 * 1024 * 1024,
      jwt: jwtConfig,
      port = 3000,
      host,
      docs,
      cors
    } = this.config;

    // Register the fastifyExpress plugin to use the express methods
    await fastifyApp.register(fastifyExpress);

    // Register the fastifyFormBody plugin for parsing form data
    await fastifyApp.register(fastifyFormBody,{
      bodyLimit: request_body_limit,
      parser: str => qs.parse(str)
    });

    // Register the fastifyCors plugin if cors is specified to handle Cross-Origin Resource Sharing. By default the cors is false.
    if(cors){
      await fastifyApp.register(fastifyCors,{
        origin: docs?.servers ? `${docs?.servers}/${docs?.endpoint}` : `${host}:${port}${docs?.endpoint}`,
        methods: ['GET','POST','PUT','DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 600,
        preflightContinue: true,
        optionsSuccessStatus: 204
      });
    }

    // Register the Swagger UI plugin if docs endpoint is specified
    if(docs){
      await fastifyApp.register(fastifySwaggerUI)
    }

    // Register the fastifyJWT plugin for JSON Web Token support if jwtConfig is provided
    if (jwtConfig) {
      await fastifyApp.register(fastifyJWT, {
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

    if(process.env.OTEL_ENABLED === 'true'){
      fastifyApp.express.use(promMid({
        metricsPath: false,
        collectDefaultMetrics: true,
        requestDurationBuckets: promClient.exponentialBuckets(0.2, 3, 6),
        requestLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
        responseLengthBuckets: promClient.exponentialBuckets(512, 2, 10),
      }));
    }
    
    // Return the Fastify instance
    return fastifyApp;
  }

  // Subscribe to an event by creating a route
  async subscribeToEvent(eventRoute: string, eventConfig: PlainObject, eventHandler: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event?: PlainObject): Promise<void> {
    
    // Split event route into components
    const routeSplit = eventRoute.split('.');
    const httpMethod: string = routeSplit[1];
    const endpoint = routeSplit[2].replace(/{(.*?)}/g, ':$1');
    const fastifyApp = this.client;
    const {port} = this.config;

    if(fastifyApp){

      // Register a route with Fastify
      fastifyApp.route({
        method: httpMethod as HTTPMethods,
        url: endpoint,
        preHandler: this.authnHOF(event?.authn),
        handler: async (request: FastifyRequest, reply: FastifyReply) => {

          // Create a GSCloudEvent based on the request
          const gsEvent: GSCloudEvent = FastifyEventSource.createGSEvent(request, endpoint);

          // Process the event using the provided function
          const status: GSStatus = await eventHandler(gsEvent, { key: eventRoute, ...eventConfig });

          // Respond with the status
          reply
            .code(status.code || 200)
            // if data is a integer, it takes it as statusCode, so explicitly converting it to string
            .send(Number.isInteger(status.data) ? String(status.data) : status.data);
        },
      });

      // Start listening on the specified port
      fastifyApp.listen({port});
      return Promise.resolve();
    }
    return Promise.reject();
  }

  // Higher-order function for JWT authentication
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

  // Create a GSCloudEvent based on the FastifyRequest and endpoint
  static createGSEvent(request: FastifyRequest, endpoint: string) {

    // Omit certain properties from the request object
    const reqProp = FastifyEventSource.omit(request, ['_readableState','socket','client','_parsedUrl','res','app']);

    // Pick only the 'headers' property from the request object
    const reqHeaders = FastifyEventSource.pick(request, ['headers']);

    // Merge the properties into a new data object
    let data = { ...reqProp, ...reqHeaders };

    // Create a GSCloudEvent instance
    const event: GSCloudEvent = new GSCloudEvent('id', endpoint, new Date(), 'http', '1.0', data, 'REST', new GSActor('user'), {});
    return event;
  }

  // Helper function to omit properties from an object
  static omit(obj: Record<string, any>, keys: string[]): Record<string, any> {
    const result: Record<string, any> = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  }

  // Helper function to pick properties from an object
  static pick(obj: Record<string, any>, keys: string[]): Record<string, any> {
    return keys.reduce((acc:any, key) => {
      if (obj.hasOwnProperty(key)) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }

}

const SourceType = 'ES';
const Type = "fastify"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "fastify"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {port: 3000, docs: {endpoint: '/api-docs'}};

export {
  FastifyEventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
