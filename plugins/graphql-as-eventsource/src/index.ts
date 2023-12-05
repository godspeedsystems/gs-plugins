import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, GSDataSource, GSContext } from "@godspeedsystems/core";
import { ApolloServer, gql } from 'apollo-server';
import path from 'path';
import fs from 'fs-extra'

class EventSource extends GSEventSource {

  private allResolvers: any = {};

  private allevents: any = {};

  private timeOutTimer: any = null;

protected initClient(): Promise<PlainObject> {
    return Promise.resolve(ApolloServer);
}

async subscribeToEvent(eventKey: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>, event_info: PlainObject): Promise<void> {
  this.allevents[eventKey] = event_info
  let es = eventKey.split('.')[0];
  let method = eventKey.split('.')[1]
  let type_name = null
  if (method === "get") {
    type_name = "Query";
  } else {
    type_name = "Mutation";
  }
  let endpoint = eventKey.split('.')[2];
  let modifiedString = endpoint.replace(/{(.*?)}/g, '$1');
  modifiedString = modifiedString.replace(/\//g, '_');
  let subquery = method + modifiedString
  if (!this.allResolvers[type_name]) {
    this.allResolvers[type_name] = {}
  }
  this.allResolvers[type_name][subquery] = async (parent: any, args: any, contextValue: any, info: any) => {
    const { body, ...rest } = args
    const event = new GSCloudEvent(
      "id",
      eventKey,
      new Date(),
      "Apollo",
      "1.0",
      { body: body, params: rest },
      "messagebus",
      new GSActor("user"),
      {}
    );
    let res = await processEvent(event, eventConfig);
    return res.data;
  };
  const chosenPort = this.config.port || 4000;
  if (this.timeOutTimer) {
    clearTimeout(this.timeOutTimer)
  }
  this.timeOutTimer = setTimeout(async () => {
    const schemaFilePath = path.join(process.cwd(), `/src/eventsources/${es}.graphql`);
    const typeDefs = gql(fs.readFileSync(schemaFilePath, 'utf8'));

    const server = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: this.allResolvers,
    });

    try {
      await server.listen({ port: chosenPort });
      console.log(`Server listening at http://localhost:${chosenPort}`);
    } catch (error: any) {
      console.error('Error starting the server:', error.message);
      process.exit(1);
    }
  }, 3000
  )
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

