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
#### Godspeed Plugins are the way to extend the core godspeed framework. Currently we support adding Event Source and Data Source as plugin.

## Event Source

An event source is any entity or technology responsible for generating events or notifications when specific events or conditions occur. These events are consumed by event handlers or processors for real-time or near-real-time responses. Event sources can include Message Brokers, Webhooks etc.The settings for each datasource lies in src/eventsources directory.

## Data Source

Any kind of entity which provides read and write mechanism for data is considered a datasource. For example, an API, a SQL or NoSQL datastore which includes RDBMS or mongodb,postgresql, key value stores, document stores etc. The settings for each datasource lies in src/datasources directory.


 
 ## Plug-in 🔗


A brief description of how we write new plug-in in godspeed framework. 

### Steps to create new plug-in in our godspeed framework:


1. Begin by understanding the folder `structure`.

```

    .
    ├── src
        ├── datasources
        │   ├── types
        │   |    └── plugin.ts
        |   |
        │   └── plugin.yaml       
        │ 
        ├── events
        |   |
        │   └── helloworld.yaml 
        |    
        ├── eventsources
        │   ├── types
        │   |    └── plugin.ts
        |   |
        │   └── plugin.yaml 
        |  
        └── functions
            |
            └── helloworld.yaml


```

## Plugin as Datasource : Example (axios-as-datasource plug-in ):

1. Inside the `datasources` directory, create a `YAML` file with a specific name. In this YAML file, ensure you specify a `type` field, and there must be a corresponding `TypeScript` file in the `types` directory that shares the same name as the `type` you defined.

2. Look for the `npm package` you wish to integrate with  Godspeed framework.

3. In your TypeScript file, use an import statement to bring in `GSDataSource` from the `@godspeedsystems/core` package. Then, create a class that inherits from `GSDataSource`.

4. Afterward, you can access the methods provided by `GSDataSource`. Initialize your client by calling the `initClient()` function.

5. Once your client is initialized, you can execute its methods using the `execute` function.


#### axios config ( src/datasources/axios.yaml )
```yaml
type: axios
baseURL: http://localhost:5440
```

#### initializing client and execution ( src/datasources/types/axios.ts ) :   

``` typeScript
import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { PrismaClient } from "@prisma/client"


class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
   
    
  }
}

```
#### Example Event ( src/events/axios_event.yaml ) :
```yaml
"http.get./helloworld":
  fn:axios_workflow :
  body:
    type: object
  responses:
    200:
      application/json:
```
#### Example workflow ( src/functions/axios_workflow.yaml ) :
```yaml
id: helloworld
tasks:
  id: fist_task
    fn: datasource.axios./helloworld
    args: 

```

## Plugin as Eventsource : Example ( cron plug-in ):

1. Inside the `eventsources` directory, create a `YAML` file with a specific name. In this YAML file, ensure you specify a `type` field, and there must be a corresponding `TypeScript` file in the `types` directory that shares the same name as the `type` you defined.

2. Look for the `npm package` you wish to integrate with  Godspeed framework.

3. In your TypeScript file, use an import statement to bring in `GSEventSource` from the `@godspeedsystems/core` package. Then, create a class that inherits from `GSEventSource`.

4. Afterward, you can access the methods provided by `GSEventSource`. Initialize your client by calling the `initClient()` function.

5. Once your client is initialized, you can execute its subscription using the `subscribeToEvent` function.


#### cron config ( src/datasources/kafka.yaml )
```yaml
type: cron
```

#### initializing client and execution ( src/eventsources/types/cron.ts ) :   

```javascript
import { GSEventSource } from "@godspeedsystems/core/dist/core/_interfaces/sources";
import { GSCloudEvent, GSStatus, GSActor } from "@godspeedsystems/core";
import { PlainObject } from "@godspeedsystems/core";
import cron from "node-cron";

export default class CronEventSource extends GSEventSource {
  protected initClient(): Promise<PlainObject> {
    // initialize client here
  }
  subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (
      event: GSCloudEvent,
      eventConfig: PlainObject
    ) => Promise<GSStatus>
  ): Promise<void> {
    // write subscribe method here
  }
}
```



#### cron event  ( src/events/every_minute_task.yaml )

```yaml
# event for Shedule a task for evrey minute.

cron.* * * * *.Asia/Kolkata:
  fn: every_minute

```
For  cron expressions   `https://crontab.cronhub.io/`

#### cron workflow to schedule ( src/functions/every_minute.yaml )


```yaml
summary: this workflow will be running every minute
tasks:
  - id: print
    description: print for every minute
    fn: com.gs.return
    args:
      data: HELLO from CRON
```


## Plugin as DatasourceAsEventsource : Example ( kafka plug-in ):
1. Look for the `npm package` you wish to integrate with  Godspeed framework.

2. Inside the `DataSources` directory, create a `YAML` file with a specific name. In this YAML file, ensure you specify a `type` field, and there must be a corresponding `TypeScript` file in the `types` directory that shares the same name as the `type` you defined.


3. In your TypeScript file, use an import statement to bring in `GSDataSource` from the `@godspeedsystems/core` package. Then, create a class that inherits from `GSDataSource`.

4. Afterward, you can access the methods provided by `GSDataSource`. Initialize your client by calling the `initClient()` function.

5. Once your client is initialized, you can execute its methods using the `execute` function.

#### kafka config ( src/datasources/kafka.yaml )
```yaml
type: Kafka
clientId: "kafka_proj"
brokers: ["kafka:9092"]
```

#### initializing client and execution ( src/datasources/types/Kafka.ts ) :   

```javascript
import { GSContext, GSDataSource, PlainObject } from "@godspeedsystems/core";
import { Kafka } from "kafkajs"; // importing required npm module.

export default class KafkaAsDataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    // initialize your client.
  }
  
  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      // execute methods here
    } catch (error) {
      throw error;
    }
  }
}
```



#### Example Event ( src/events/kafka_publish_event.yaml ) :
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

#### Function Example ( src/functions/kafka-publish.yaml ) :


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


6. Inside the `eventsources` directory, create a `YAML` file with a specific name. In this YAML file, ensure you specify a `type` field, and there must be a corresponding `TypeScript` file in the `types` directory that shares the same name as the `type` you defined.

7. In your TypeScript file, use an import statement to bring in `GSEventSource` from the `@godspeedsystems/core` package. Then, create a class that inherits from `GSEventSource`.

8. Your client is initialized already in Datasource so you can execute its subscription using the `subscribeToEvent` function.


#### kafka config ( src/eventsources/kafka.yaml )
```yaml
type: kafka
groupId: "kafka_proj"
```

#### subscribeToEvent ( src/eventsources/types/Kafka.ts ) :   

```javascript
import { GSDataSourceAsEventSource } from "@godspeedsystems/core/dist/core/_interfaces/sources";
import { GSCloudEvent,  GSStatus,  GSActor} from "@godspeedsystems/core";
import { PlainObject } from "@godspeedsystems/core";


export default class KafkaDataSourceAsEventSource extends GSDataSourceAsEventSource { async subscribeToEvent(eventKey: string,  eventConfig: PlainObject, processEvent: (event: GSCloudEvent,  eventConfig: PlainObject) => Promise<GSStatus>): Promise<void> {

// Write your Subscribe method here.

}
}

```
#### Example Event for consume ( src/events/kafka_consumer_event.yaml ) :

```yaml
kafka.publish-producer1.kafka_proj:
  id: kafka__consumer
  fn: kafka_consume
  body:
    description: The body of the query
    content:
      application/json: 
        schema:
          type: string

```

#### Example workflow for consumer ( src/functions/kafka-consume.yaml ) :


```yaml
id: kafka-conumer
summary: consumer
tasks:
    - id: set_con
      fn: com.gs.return
      args: <% inputs %>
        
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
| 8  | Elasticsearch                                |      |                  |               |               |
| 9  | Splunk                                       |      |                  |               |               |
| 10  | Apache Kafka                                 |      |                  |               |               |
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
