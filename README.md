<div align="center">
  <a href="https://www.godspeed.systems">
    <img
      src="https://static.wixstatic.com/media/f90422_f39401b0fbe14da482ef9c5389665b41~mv2.png/v1/crop/x_0,y_531,w_1080,h_220/fill/w_295,h_60,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Logo%20(8).png"
      alt="Godspeed"
      height="64"
    />
  </a>
  <h3>
    <b>
      Godspeed
    </b>
  </h3>
  <b>
    Open Source Plugins Development Ecosystem
  </b>
  <p>

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CONTRIBUTIONS.md)   [![Open Bounties](https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fgodspeedsystems%2Fbounties%3Fstatus%3Dopen)](https://console.algora.io/org/godspeedsystems/bounties?status=open)  [![Discord](https://img.shields.io/badge/chat-discord-brightgreen.svg?logo=discord&style=flat)](https://discord.com/invite/MKjv3KdD7X)
  </p>



  <br />

</div>

# Godspeed Plug-in 🔗
#### Godspeed Plugins are the way to extend the core godspeed framework. Currently we support adding Event Source and Data Source as plugin.




A brief description of how we write new plug-in in godspeed framework.

### Steps to create new plug-in in our godspeed framework:
Certainly, here are the provided steps rephrased:

1. Begin by installing the `godspeed-plugin-generator` globally using the following commands:

   ```bash
   npm install -g generator-godspeed-plugin
   npm install -g yo
   ```

2. To initiate the creation of your plugin, execute the following command in your terminal:

   ```bash
   yo godspeed-plugin
   ```

3. After running the above command, you'll be prompted to enter your desired plugin name. Proceed by typing it in:

   ```bash
   ? Enter your plugin name: (your-plugin-name)
   ```

4. Select the type of plugin that aligns with your project's requirements. You can choose from the following options:

   ```bash
   ? Select the type of plugin: (Use arrow keys)
   ❯ DataSource 
     EventSource 
     DataSource-As-EventSource 
   ```

5. Depending on your selection, the plugin generator will generate a template with your chosen plugin name, such as "your-plugin-name-as-datasource." The structure of the generated files will be as follows:

   ```
   .
   ├── src
   |   └── index.ts
   |
   ├── package.json
   |
   ├── README.md
   |
   ├── tsconfig.json
   |
   ├── .gitignore
   |
   └── .npmignore
   ```

6. To customize your plugin, navigate to the `index.ts` file located in the `src` directory. You can modify the content within this file to meet your specific plugin requirements. There's no need to make changes to any other files outside of `index.ts`.


**If you opt for `DataSource`, the `index.ts` file appears as follows:**

  ```

    import { GSContext,  GSDataSource, GSStatus, PlainObject,} from "@godspeedsystems/core";

    export default class DataSource extends GSDataSource {
    protected async initClient(): Promise<object> {
        try {
          // initialize your client
        } catch (error) {
        throw error;
        }
    }

    async execute(ctx: GSContext, args: PlainObject): Promise<any> {
        
        try {
          // execute methods
          
        } catch (error) {
          throw error;
        }
    }
    }
    const SourceType = 'DS';
    const Type = "y"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
    const CONFIG_FILE_NAME = "y"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
    const DEFAULT_CONFIG = {};

    export {
      DataSource,
      SourceType,
      Type,
      CONFIG_FILE_NAME,
      DEFAULT_CONFIG
    }
  ```

**If you opt for `EventSource`, the `index.ts` file appears as follows:**
  ```
    import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, GSDataSource, GSContext } from "@godspeedsystems/core";


    class EventSource extends GSEventSource {

    protected initClient(): Promise<PlainObject> {
        // initialize your client
    }
    async subscribeToEvent(eventRoute: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>): Promise<void> {
        try {
          //  subscribeToEvent
          
        } catch (error) {
          throw error;
        }
    }
    }

    const SourceType = 'ES';
    const Type = "p"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
    const CONFIG_FILE_NAME = "p"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
    const DEFAULT_CONFIG = {};

    export {
      EventSource,
      SourceType,
      Type,
      CONFIG_FILE_NAME,
      DEFAULT_CONFIG
    }
  ```
**If you opt for `DataSource-As-EventSource `, the `index.ts` file appears as follows:**

  ```

    import { GSContext, GSDataSource, PlainObject, GSDataSourceAsEventSource, GSCloudEvent, GSStatus, GSActor} from "@godspeedsystems/core";

    class DataSource extends GSDataSource {
      protected async initClient(): Promise<PlainObject> {
        try {
          
          // initialize your client
        } catch (error) {
          throw error;
        }

      }

      async execute(ctx: GSContext, args: PlainObject): Promise<any> {
        try {
          // execute methods
          
        } catch (error) {
          throw error;
        }
      }
    }

    class EventSource extends GSDataSourceAsEventSource {
      async subscribeToEvent(
        eventKey: string,
        eventConfig: PlainObject,
        processEvent: (
          event: GSCloudEvent,
          eventConfig: PlainObject
        ) => Promise<GSStatus>
      ): Promise<void> {

        //  subscribeToEvent
      }
    }
    const SourceType = 'BOTH';
    const Type = "shirisha"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
    const CONFIG_FILE_NAME = "shirisha"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
    const DEFAULT_CONFIG = {};

    export {
      DataSource,
      EventSource,
      SourceType,
      Type,
      CONFIG_FILE_NAME,
      DEFAULT_CONFIG
    }
  ``` 
7. For better understanding checkout Examples.

      [AWS](https://github.com/godspeedsystems/gs-plugins/tree/main/plugins/aws-as-datasource/src/index.ts) (DataSource)

      [CRON](https://github.com/godspeedsystems/gs-plugins/tree/main/plugins/cron-as-eventsource/src/index.ts) (EventSource)

      [KAFKA](https://github.com/godspeedsystems/gs-plugins/blob/main/plugins/kafka-as-datasource-as-eventsource/src/index.ts) (DataSource-As-EventSource)


## List of Plugins

<!-- plugin name || type = (eventsource, datasource, both) || npm package link(text = current version) || documentation || maintained by? = (community | godspeed.systems) -->

| No  | Plugin Name                                  | Type | npm package link | Documentation | Maintained by |
| --- | -------------------------------------------- | ---- | ---------------- | ------------- | ------------- |
| 1   | Express|Eventsource|[npm](https://www.npmjs.com/package/@godspeedsystems/plugins-express-as-http)|[readme](./plugins/express-as-http/README.md)|Godspeed|
| 2   | Prisma|Datasource|[npm](https://www.npmjs.com/package/@godspeedsystems/plugins-prisma-as-datastore)|[readme](./plugins/prisma-as-datastore/README.md)|  Godspeed|
| 3  | Apache Kafka                                 |DS & ES|       |[readme](./plugins/kafka-as-datasource-as-eventsource/README.md)      |                Godspeed  |
| 4   | CRON Eventsource                                   |  Eventsource    | [npm](https://www.npmjs.com/package/@godspeedsystems/plugins-cron)|[readme](./plugins/cron-as-eventsource/README.md)                 |Godspeed               |
| 5   | MongoDB                                      |      |                  |               |               |
| 6   | Cassandra                                    |      |                  |               |               |
| 7   | Redis                                        |      |                  |               |               |
| 8  | Elasticsearch                                |      |                  |               |               |
| 9  | Splunk                                       |      |                  |               |               |
| 10   | MySQL                                        |      |                  |               |               |
| 11  | RabbitMQ                                     |      |                  |               |               ||
| 12  | Amazon S3                                    |      |                  |               |               |
| 13  | Salesforce                                   |      |                  |               |               |
| 14  | HubSpot                                      |      |                  |               |               |
| 15  | MailChimp                                    |      |                  |               |               |
| 16  | Microsoft Access                             |      |                  |               |               |
| 17  | SQLite                                       |      |                  |               |               |
| 18  | DB2 (IBM Database)                           |      |                  |               |               |
| 19  | Neo4j                                        |      |                  |               |               |
| 20  | CockroachDB                                  |      |                  |               |               |
| 21  | MariaDB                                      |      |                  |               |               |
| 22  | Google Cloud Pub/Sub                         |      |                  |               |               |
| 23  | RabbitMQ                                     |      |                  |               |               |
| 24 | GraphQL                                      |      |                  |               |               |
| 25 | gRPC                                         |      |                  |               |               |
| 26 | JMeter                                       |      |                  |               |               |
| 27 | JIRA Software                                |      |                  |               |               |
| 28 | Jenkins                                      |      |                  |               |               |
| 29 | GitLab CI/CD                                 |      |                  |               |               |
| 30 | Azure DevOps                                 |      |                  |               |               |
| 31 | Heroku                                       |      |                  |               |               |
| 32 | Vercel                                       |      |                  |               |               |
| 33 | Netlify                                      |      |                  |               |               |
| 34   | PostgreSQL                                   |      |                  |               |               |