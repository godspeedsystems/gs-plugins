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

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CONTRIBUTIONS.md)   [![Website](https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fcal%2Fbounties%3Fstatus%3Dopen)](https://github.com/godspeedsystems/gs-plugins/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%92%8E+Bounty%22)   [![Discord](https://img.shields.io/badge/chat-discord-brightgreen.svg?logo=discord&style=flat)](https://discord.gg/ZGxjWAHA)
  </p>


 
  <br />
 
</div>

# Godspeed Plugins
### Godspeed Plugins are the way to extend the core godspeed framework. Currently we support adding Event Source and Data Source as plugin.

## Event Source

##### Any kind of entity which provides read and write mechanism for data is considered a datasource. For example, an API, a SQL or NoSQL datastore which includes RDBMS or mongodb,postgresql, key value stores, document stores etc. The settings for each datasource lies in src/datasources directory.

## Data Source

##### Any kind of entity which provides read and write mechanism for data is considered a datasource. For example, an API, a SQL or NoSQL datastore which includes RDBMS or mongodb,postgresql, key value stores, document stores etc. The settings for each datasource lies in src/datasources directory.


 
 ## Plug-in 🔗


A brief description of how we write new plug-in in godspeed framework. 

### Steps to create new plug-in in our godspeed framework:


1. Begin by understanding the folder `structure`.

2. Inside the `EventSources` directory, create a `YAML` file with a specific name. In this YAML file, ensure you specify a `type` field, and there must be a corresponding `TypeScript` file in the `types` directory that shares the same name as the `type` you defined.

3. Look for the `npm package` you wish to integrate with our Godspeed framework.

4. In your TypeScript file, use an import statement to bring in `GSDataSource` from the `@godspeedsystems/core` package. Then, create a class that inherits from `GSDataSource`.

5. Afterward, you can access the methods provided by `GSDataSource`. Initialize your client by calling the `initClient()` function.

6. Once your client is initialized, you can execute its methods using the `execute` function.
## Example ( kafka plug-in ):
### kafka config ( src/datasources/kafka.yaml )
```yaml
type: Kafka
clientId: "kafka_proj"
brokers: ["kafka:9092"]
```

### initializing client and execution ( src/datasources/types/Kafka.ts ) :   

```javascript
import { GSContext, GSDataSource, PlainObject } from "@godspeedsystems/core";
import { Kafka } from "kafkajs"; // importing required npm module.

export default class KafkaAsDataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    const kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers,
    });

    return kafka; // client initialized.
  }
  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const {
        topic,
        message,
        meta: { fnNameInWorkflow },
      } = args; // destructuring variables from args.

      let method = fnNameInWorkflow.split(".")[2];
      if (this.client) {
        const producer = this.client.producer();
        await producer.connect();
        let result = await producer.send({
          topic: topic,
          messages: [{ value: message }],
        });
        return result;
      }
    } catch (error) {
      throw error;
    }
  }
}
```
## Example Event ( src/events/kafka_publish_event.yaml ) :
```yaml
'http.post./kafka-pub':
  fn: kafka-publish
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
          required: ['message']
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string

```

## Function Example ( src/functions/kafka-publish.yaml ) :


```yaml
id: kafka-publish
summary: kafka publish message
tasks:
    - id: publish
      fn: datasource.kafka.producer
      args:
        topic: "publish-producer1"
        message: <% inputs.body.message%>
```
## List of Plugins

<!-- plugin name || type = (eventsource, datasource, both) || npm package link(text = current version) || documentation || maintained by? = (community | godspeed.systems) -->

| No  | Plugin Name                                  | Type | npm package link | Documentation | Maintained by |
| --- | -------------------------------------------- | ---- | ---------------- | ------------- | ------------- |
| 1   | Express|Eventsource|[plugins-express-as-http](https://www.npmjs.com/package/@godspeedsystems/plugins-express-as-http)|[Link](https://github.com/godspeedsystems/gs-plugins/blob/main/express-as-http/README.md)|Godspeed|
| 2   | Prisma|Datasource|[plugins-prisma-as-datastore](https://www.npmjs.com/package/@godspeedsystems/plugins-prisma-as-datastore)|[Link](https://github.com/godspeedsystems/gs-plugins/blob/main/prisma-as-datastore/README.md)|  Godspeed|
| 3   | MySQL                                        |      |                  |               |               |
| 4   | PostgreSQL                                   |      |                  |               |               |
| 5   | MongoDB                                      |      |                  |               |               |
| 6   | Cassandra                                    |      |                  |               |               |
| 7   | Redis                                        |      |                  |               |               |
| 14  | Elasticsearch                                |      |                  |               |               |
| 19  | Splunk                                       |      |                  |               |               |
| 20  | Apache Kafka                                 |      |                  |               |               |
| 21  | RabbitMQ                                     |      |                  |               |               ||
| 33  | Amazon S3                                    |      |                  |               |               |
| 34  | Dropbox Business                             |      |                  |               |               |
| 35  | Box                                          |      |                  |               |               |
| 36  | OneDrive for Business                        |      |                  |               |               |
| 37  | Salesforce                                   |      |                  |               |               |
| 38  | HubSpot                                      |      |                  |               |               |
| 39  | Zendesk                                      |      |                  |               |               |
| 40  | MailChimp                                    |      |                  |               |               |
| 41  | Microsoft Access                             |      |                  |               |               |
| 42  | SQLite                                       |      |                  |               |               |
| 43  | Sybase                                       |      |                  |               |               |
| 44  | DB2 (IBM Database)                           |      |                  |               |               |
| 45  | Neo4j                                        |      |                  |               |               |
| 53  | CockroachDB                                  |      |                  |               |               |
| 54  | Amazon Aurora                                |      |                  |               |               |
| 55  | MariaDB                                      |      |                  |               |               |
| 77  | Google Cloud Pub/Sub                         |      |                  |               |               |
| 78  | RabbitMQ                                     |      |                  |               |               |
| 168 | GraphQL                                      |      |                  |               |               |
| 170 | gRPC                                         |      |                  |               |               |
| 174 | GraphQL                                      |      |                  |               |               |
| 179 | JMeter                                       |      |                  |               |               |
| 191 | JIRA Software                                |      |                  |               |               |
| 194 | Jenkins                                      |      |                  |               |               |
| 197 | GitLab CI/CD                                 |      |                  |               |               |
| 199 | Azure DevOps                                 |      |                  |               |               |
| 202 | Heroku                                       |      |                  |               |               |
| 203 | Vercel                                       |      |                  |               |               |
| 204 | Netlify                                      |      |                  |               |               |
