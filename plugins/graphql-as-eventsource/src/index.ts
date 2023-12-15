import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource } from "@godspeedsystems/core";
import { ApolloServer, gql, AuthenticationError } from 'apollo-server';
import path from 'path';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';

interface Resolver {
  [key: string]: any;
}

interface Event {
  [key: string]: PlainObject;
}

class EventSource extends GSEventSource {
  private allResolvers: Resolver = {};
  private allEvents: Event = {};
  private timeoutTimer: NodeJS.Timeout | null = null;

  protected initClient(): Promise<PlainObject> {
    return Promise.resolve(ApolloServer);
  }

  async subscribeToEvent(eventKey: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event_info: PlainObject): Promise<void> {
    this.allEvents[eventKey] = event_info;
    const [es, method, endpoint] = eventKey.split('.');
    const typeName = this.getTypeName(method);
    const modifiedString = this.getModifiedString(endpoint);
    const subquery = `${method}${modifiedString}`;

    if (!this.allResolvers[typeName]) {
      this.allResolvers[typeName] = {};
    }

    this.allResolvers[typeName][subquery] = this.getResolver(method, processEvent, eventConfig, event_info);

    const chosenPort = this.config.port || 4000;
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    this.timeoutTimer = setTimeout(() => this.startServer(es, chosenPort), 3000);
  }

  private getTypeName(method: string): string {
    return method === "get" ? "Query" : "Mutation";
  }

  private getModifiedString(endpoint: string): string {
    let modifiedString = endpoint.replace(/{(.*?)}/g, '$1');
    return modifiedString.replace(/\//g, '_');
  }

  private getResolver(method: string, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, eventConfig: PlainObject, event_info: PlainObject) {
    return async (parent: any, args: any, contextValue: any, info: any) => {
      const { body, ...rest } = args;
      const event = new GSCloudEvent(
        "id",
        `${method}.${event_info}`,
        new Date(),
        "Apollo",
        "1.0",
        { body: body, params: rest },
        "messagebus",
        new GSActor("user"),
        {}
      );

      if (this.config.jwt) {
        if (event_info.authn === true || event_info.authn === undefined) {
          if (contextValue.Authenticated) {
            let res = await processEvent(event, eventConfig);
            return res.data;
          } else {
            return 'UnAuthorized';
          }
        } else {
          let res = await processEvent(event, eventConfig);
          return res.data;
        }
      } else {
        let res = await processEvent(event, eventConfig);
        return res.data;
      }
    };
  }

  private async startServer(es: string, chosenPort: string | number) {
    const schemaFilePath = path.join(process.cwd(), `/src/eventsources/${es}.graphql`);
    const typeDefs = gql(fs.readFileSync(schemaFilePath, 'utf8'));

    const server = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: this.allResolvers,
      cors: this.config?.cors || false,
      context: ({ req }) => {
        if (this.config.jwt) {
          const token = req.headers.authorization || '';
          try {
            const Authenticated: any = jwt.verify(token, this.config.jwt.secretOrKey);
            if (Authenticated.iss === this.config.jwt.iss && Authenticated.aud === this.config.jwt.aud) {
              return { Authenticated: true };
            } else {
              return { Authenticated: false };
            }
          } catch (error: any) {
            throw new AuthenticationError(`INVALID_TOKEN`);
          }
        }
      },
    });

    try {
      await server.listen({ port: chosenPort });
      console.log(`Server listening at http://localhost:${chosenPort}`);
    } catch (error: any) {
      console.error('Error starting the server:', error.message);
      process.exit(1);
    }
  }
}

const SourceType = 'ES';
const Type = "graphql"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "graphql"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}