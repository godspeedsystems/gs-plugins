
// import { EventSource } from '@godspeedsystems/plugins-graphql-as-eventsource';
// export default EventSource;

import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, logger } from "@godspeedsystems/core";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import path from 'path';
// import fs from 'gs-extra';
import fs from 'fs';
import jwt from 'jsonwebtoken';

export default class EventSource extends GSEventSource {
  private allResolvers: PlainObject = {};
  private allEvents: PlainObject = {};
  private timeoutTimer: NodeJS.Timeout | null = null;

  private jwtAuth: boolean = false;

  protected initClient(): Promise<PlainObject> {

    const jwtConfig = this.config.authn?.jwt || this.config.jwt;
    if (jwtConfig) {
      this.jwtAuth = true;
      if (!jwtConfig.secretOrKey || !jwtConfig.audience || !jwtConfig.issuer) {
        logger.fatal('Invalid jwt settings. Check JWT secretOrKey, audience and issuer keys are set properly in graphql event source yaml file. Exiting');
        process.exit(1);
      }
    }
    return Promise.resolve(ApolloServer);
  }

  async subscribeToEvent(eventKey: string, eventConfig: PlainObject, eventHandler: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event_info: PlainObject): Promise<void> {
    this.allEvents[eventKey] = event_info;
    const [es, method] = eventKey.split('.');
    const typeName = this.getTypeName(method);

    if (!this.allResolvers[typeName]) {
      this.allResolvers[typeName] = {};
    }
    const operationId = this.getOperationId(eventKey, eventConfig);
    const endpoint = eventKey.split('.')[2].replace(/{(.*?)}/g, ':$1');
    this.allResolvers[typeName][operationId] = this.getResolver(method, endpoint, eventHandler, eventConfig, event_info);

    const chosenPort = this.config.port || 4000;
    if (this.timeoutTimer) {
      // logger.info('clearing tmeout to start')

      clearTimeout(this.timeoutTimer);
    }
    // logger.info('setting tmeout to start')
    this.timeoutTimer = setTimeout(() => {
      this.startServer(es, chosenPort);
      logger.info('Graphql server started')
      }, 5000);
  }
  getOperationId (eventKey: string, eventConfig: PlainObject): string {
  
    let operationId = eventConfig.operationId || eventConfig.id || eventConfig.summary?.trim().replaceAll(/\s+/g, '_');
    if (operationId) {
      return operationId;
    }
    const [method, endpoint] = eventKey.split('.');
    //Replace {} from around path params in the url
    let modifiedString = endpoint.replace(/{(.*?)}/g, '$1');
    //Replace / with _
    modifiedString = modifiedString.replace(/\//g, '_');
  
    return `${method}${modifiedString}`;
  
  }
  private getTypeName(method: string): string {
    return method === "get" ? "Query" : "Mutation";
  }

  private getResolver(method: string, endpoint: string, eventHandler: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, eventConfig: PlainObject, eventInfo: PlainObject) {
    return async (parent: any, args: any, contextValue: any, info: any) => {
      const { body, ...rest } = args;
      const event = new GSCloudEvent(
        "id",
        endpoint,
        new Date(),
        "Apollo",
        "1.0",
        { body: body, params: rest,  query: rest, user: contextValue.user, headers: contextValue.headers },
        "REST",
        new GSActor("user"),
        {}
      );

      if (this.jwtAuth) {
        // if (eventInfo.authn !== false && (this.config.authn?.jwt || this.config.authn)) {
          let res = await eventHandler(event, eventConfig);
          return res.data;
        // } else {
        //   let res = await eventHandler(event, eventConfig);
        //   return res.data;
        // }
      } else {
        let res = await eventHandler(event, eventConfig);
        return res.data;
      }
    };
  }

  private async startServer(es: string, chosenPort: number = 4000) {
    const schemaFilePath = path.join(process.cwd(), `/src/eventsources/${es}.graphql`);
    const typeDefs = fs.readFileSync(schemaFilePath, 'utf8');
    // const typeDefs = `scalar JSON type Query {
    //     get_helloworld(name: String): JSON!
    //   }`;
    const server = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: this.allResolvers,
      introspection: true,
    });

    try {
      await startStandaloneServer(server, {

        context: async ({ req, res }) => {
          if (!this.jwtAuth) {
            return {user:null, headers: req.headers};
          }
          // Note: This example uses the `req` argument to access headers,
          // but the arguments received by `context` vary by integration.
          // This means they vary for Express, Fastify, Lambda, etc.

          // For `startStandaloneServer`, the `req` and `res` objects are
          // `http.IncomingMessage` and `http.ServerResponse` types.

          // Get the user token from the headers.
          let token = req.headers.authorization || '';
          //Parse and verify token. Fill the user.
          let parsedJwt: any ;
          const secret:String = this.config.authn?.jwt.secretOrKey || this.config.jwt.secretOrKey;
          if (token.indexOf('Bearer ') === 0) {
            token = token.substring(7);
          }
          try {
            // logger.info('parsing jwt %s %s', req.url, req.headers.authorization)
            parsedJwt = jwt.verify(token, secret as jwt.Secret);
            // logger.info('parsed jwt');
          } catch (error) {
            throw new GraphQLError('Invalid token', {
              extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 },
              },
            });
          }
          
          const issuer = this.config.authn?.jwt.issuer || this.config.jwt.issuer;
          const audience = this.config.authn?.jwt.audience || this.config.jwt.audience;
          if (parsedJwt.iss !== issuer && parsedJwt.aud !== audience) {
            // logger.info('iss or key did not match', parsedJwt);
            throw new GraphQLError('Invalid token', {
              extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 },
              },
            });
          }

          // Add the user to the context
          return { user: parsedJwt, headers: req.headers };
        },
        listen: {port: chosenPort },

      });
      logger.info(`Server listening at http://localhost:${chosenPort}`);
    } catch (error: any) {
      logger.info('Error starting the server: %s %o', error.message, error);
      process.exit(1);
    }
  }
}

const SourceType = 'ES';
const Type = "graphql"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "graphql"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
  type: "graphql",
  port: 4000,
  authn:{
    jwt:{
      secretOrKey: "",
      audience: "",
      issuer: ""
    }},
  authz:[{
    id: "",
    fn: "",
    args: ""
  }],
  on_request_validation_error:"",
  on_response_validation_error: "",
  log:{ 
    attributes:{
    eventsource_type: ""
    }
  }
};

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}