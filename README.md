# Godspeed Plugins

Godspeed Plugins are the way to extend the core godspeed framework. Currently we support adding Event Source and Data Source as plugin.

## Event Source

## Data Source


 
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
| 1   | Microsoft SQL Server                         |      |                  |               |               |
| 2   | Oracle Database                              |      |                  |               |               |
| 3   | MySQL                                        |      |                  |               |               |
| 4   | PostgreSQL                                   |      |                  |               |               |
| 5   | MongoDB                                      |      |                  |               |               |
| 6   | Cassandra                                    |      |                  |               |               |
| 7   | Redis                                        |      |                  |               |               |
| 8   | Amazon RDS                                   |      |                  |               |               |
| 9   | Google Cloud SQL                             |      |                  |               |               |
| 10  | Amazon Redshift                              |      |                  |               |               |
| 11  | Google BigQuery                              |      |                  |               |               |
| 12  | Apache Hadoop                                |      |                  |               |               |
| 13  | Apache Spark                                 |      |                  |               |               |
| 14  | Elasticsearch                                |      |                  |               |               |
| 15  | Tableau                                      |      |                  |               |               |
| 16  | QlikView                                     |      |                  |               |               |
| 17  | Power BI                                     |      |                  |               |               |
| 18  | Google Analytics                             |      |                  |               |               |
| 19  | Splunk                                       |      |                  |               |               |
| 20  | Apache Kafka                                 |      |                  |               |               |
| 21  | RabbitMQ                                     |      |                  |               |               |
| 22  | Apache NiFi                                  |      |                  |               |               |
| 23  | Talend                                       |      |                  |               |               |
| 24  | Apache Nutch                                 |      |                  |               |               |
| 25  | Hive                                         |      |                  |               |               |
| 26  | Apache Cassandra                             |      |                  |               |               |
| 27  | Oracle Fusion Middleware                     |      |                  |               |               |
| 28  | IBM InfoSphere                               |      |                  |               |               |
| 29  | Alteryx                                      |      |                  |               |               |
| 30  | Snowflake                                    |      |                  |               |               |
| 31  | Teradata                                     |      |                  |               |               |
| 32  | Google Cloud Storage                         |      |                  |               |               |
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
| 46  | Couchbase                                    |      |                  |               |               |
| 47  | InfluxDB                                     |      |                  |               |               |
| 48  | Oracle Exadata                               |      |                  |               |               |
| 49  | SAP HANA                                     |      |                  |               |               |
| 50  | Google Cloud Bigtable                        |      |                  |               |               |
| 51  | Amazon DynamoDB                              |      |                  |               |               |
| 52  | Azure Cosmos DB                              |      |                  |               |               |
| 53  | CockroachDB                                  |      |                  |               |               |
| 54  | Amazon Aurora                                |      |                  |               |               |
| 55  | MariaDB                                      |      |                  |               |               |
| 56  | Presto                                       |      |                  |               |               |
| 57  | Dremio                                       |      |                  |               |               |
| 58  | Druid                                        |      |                  |               |               |
| 59  | Apache Flink                                 |      |                  |               |               |
| 60  | Google Cloud Dataflow                        |      |                  |               |               |
| 61  | Microsoft Azure Stream Analytics             |      |                  |               |               |
| 62  | Apache Beam                                  |      |                  |               |               |
| 63  | Hortonworks Data Platform                    |      |                  |               |               |
| 64  | Cloudera Data Platform                       |      |                  |               |               |
| 65  | Google Cloud Dataprep                        |      |                  |               |               |
| 66  | Looker                                       |      |                  |               |               |
| 67  | Sisense                                      |      |                  |               |               |
| 68  | Domo                                         |      |                  |               |               |
| 69  | Yellowfin                                    |      |                  |               |               |
| 70  | MicroStrategy                                |      |                  |               |               |
| 71  | Google Data Studio                           |      |                  |               |               |
| 72  | Adobe Analytics                              |      |                  |               |               |
| 73  | Mixpanel                                     |      |                  |               |               |
| 74  | WebTrends                                    |      |                  |               |               |
| 75  | Heap Analytics                               |      |                  |               |               |
| 76  | Kinesis (Amazon Web Services)                |      |                  |               |               |
| 77  | Google Cloud Pub/Sub                         |      |                  |               |               |
| 78  | RabbitMQ                                     |      |                  |               |               |
| 79  | Apache Pulsar                                |      |                  |               |               |
| 80  | Apache Camel                                 |      |                  |               |               |
| 81  | Talend Data Integration                      |      |                  |               |               |
| 82  | IBM DataStage                                |      |                  |               |               |
| 83  | Apache Airflow                               |      |                  |               |               |
| 84  | MuleSoft                                     |      |                  |               |               |
| 85  | SnapLogic                                    |      |                  |               |               |
| 86  | Dell Boomi                                   |      |                  |               |               |
| 87  | Zapier                                       |      |                  |               |               |
| 88  | Segment                                      |      |                  |               |               |
| 89  | Kafka Connect                                |      |                  |               |               |
| 90  | Fivetran                                     |      |                  |               |               |
| 91  | Panoply                                      |      |                  |               |               |
| 92  | Matillion                                    |      |                  |               |               |
| 93  | Tibco Software                               |      |                  |               |               |
| 94  | Datorama                                     |      |                  |               |               |
| 95  | SAP BusinessObjects                          |      |                  |               |               |
| 96  | IBM Cognos Analytics                         |      |                  |               |               |
| 97  | Pentaho                                      |      |                  |               |               |
| 98  | GoodData                                     |      |                  |               |               |
| 99  | SAS Business Intelligence                    |      |                  |               |               |
| 100 | Yellowbrick Data                             |      |                  |               |               |
| 101 | SAP BW/4HANA                                 |      |                  |               |               |
| 102 | SAP Analytics Cloud                          |      |                  |               |               |
| 103 | SAP Lumira                                   |      |                  |               |               |
| 104 | SAP Crystal Reports                          |      |                  |               |               |
| 105 | IBM Planning Analytics                       |      |                  |               |               |
| 106 | SAS Visual Analytics                         |      |                  |               |               |
| 107 | Teradata Vantage                             |      |                  |               |               |
| 108 | Snowflake Data Warehouse                     |      |                  |               |               |
| 109 | Google Cloud Firestore                       |      |                  |               |               |
| 110 | Amazon Neptune                               |      |                  |               |               |
| 111 | Apache CouchDB                               |      |                  |               |               |
| 112 | HBase                                        |      |                  |               |               |
| 113 | RethinkDB                                    |      |                  |               |               |
| 114 | ArangoDB                                     |      |                  |               |               |
| 115 | Alibaba Cloud Database                       |      |                  |               |               |
| 116 | Tencent Cloud Database                       |      |                  |               |               |
| 117 | DigitalOcean Managed Databases               |      |                  |               |               |
| 118 | Firebase Realtime Database                   |      |                  |               |               |
| 119 | FaunaDB                                      |      |                  |               |               |
| 120 | MarkLogic                                    |      |                  |               |               |
| 121 | SAP Sybase IQ                                |      |                  |               |               |
| 122 | Greenplum                                    |      |                  |               |               |
| 123 | Actian Vector                                |      |                  |               |               |
| 124 | Exasol                                       |      |                  |               |               |
| 125 | Teradata Aster                               |      |                  |               |               |
| 126 | Qubole                                       |      |                  |               |               |
| 127 | Databricks                                   |      |                  |               |               |
| 128 | DataRobot                                    |      |                  |               |               |
| 129 | SAP Leonardo                                 |      |                  |               |               |
| 130 | Qubole Data Service (QDS)                    |      |                  |               |               |
| 131 | Diyotta                                      |      |                  |               |               |
| 132 | Syncsort                                     |      |                  |               |               |
| 133 | Unifi Software                               |      |                  |               |               |
| 134 | Attunity                                     |      |                  |               |               |
| 135 | Stitch Data Loader                           |      |                  |               |               |
| 136 | FlyData                                      |      |                  |               |               |
| 137 | Tungsten Replicator                          |      |                  |               |               |
| 138 | Periscope Data                               |      |                  |               |               |
| 139 | Sigma Computing                              |      |                  |               |               |
| 140 | Cognite Data Fusion                          |      |                  |               |               |
| 141 | Striim                                       |      |                  |               |               |
| 142 | StreamSets                                   |      |                  |               |               |
| 143 | [Fusion.io](http://Fusion.io)                |      |                  |               |               |
| 144 | Exabeam                                      |      |                  |               |               |
| 145 | AlienVault USM (Unified Security Management) |      |                  |               |               |
| 146 | Darktrace                                    |      |                  |               |               |
| 147 | LogRhythm                                    |      |                  |               |               |
| 148 | Mozenda                                      |      |                  |               |               |
| 149 | [Import.io](http://Import.io)                |      |                  |               |               |
| 150 | Apify                                        |      |                  |               |               |
| 151 | Scrapy                                       |      |                  |               |               |
| 152 | Octoparse                                    |      |                  |               |               |
| 153 | ContentGrabber                               |      |                  |               |               |
| 154 | WebHarvy                                     |      |                  |               |               |
| 155 | OutWit Hub                                   |      |                  |               |               |
| 156 | Data Miner                                   |      |                  |               |               |
| 157 | Apigee (Google Cloud API Management)         |      |                  |               |               |
| 158 | AWS API Gateway                              |      |                  |               |               |
| 159 | MuleSoft Anypoint Platform                   |      |                  |               |               |
| 160 | Apigee Edge                                  |      |                  |               |               |
| 161 | IBM API Connect                              |      |                  |               |               |
| 162 | Kong                                         |      |                  |               |               |
| 163 | WSO2 API Manager                             |      |                  |               |               |
| 164 | Postman                                      |      |                  |               |               |
| 165 | Swagger                                      |      |                  |               |               |
| 166 | RAML (RESTful API Modeling Language)         |      |                  |               |               |
| 167 | OData                                        |      |                  |               |               |
| 168 | GraphQL                                      |      |                  |               |               |
| 169 | JSON-RPC                                     |      |                  |               |               |
| 170 | gRPC                                         |      |                  |               |               |
| 171 | gRPC-Web                                     |      |                  |               |               |
| 172 | XML-RPC                                      |      |                  |               |               |
| 173 | JSON-RPC                                     |      |                  |               |               |
| 174 | GraphQL                                      |      |                  |               |               |
| 175 | gRPC                                         |      |                  |               |               |
| 176 | gRPC-Web                                     |      |                  |               |               |
| 177 | XML-RPC                                      |      |                  |               |               |
| 178 | SOAPUI                                       |      |                  |               |               |
| 179 | JMeter                                       |      |                  |               |               |
| 180 | LoadRunner                                   |      |                  |               |               |
| 181 | Gatling                                      |      |                  |               |               |
| 182 | Artillery                                    |      |                  |               |               |
| 183 | Locust                                       |      |                  |               |               |
| 184 | Blazemeter                                   |      |                  |               |               |
| 185 | [Flood.io](http://Flood.io)                  |      |                  |               |               |
| 186 | SmartBear ReadyAPI                           |      |                  |               |               |
| 187 | Applitools                                   |      |                  |               |               |
| 188 | BrowserStack                                 |      |                  |               |               |
| 189 | Sauce Labs                                   |      |                  |               |               |
| 190 | TestRail                                     |      |                  |               |               |
| 191 | JIRA Software                                |      |                  |               |               |
| 192 | Travis CI                                    |      |                  |               |               |
| 193 | CircleCI                                     |      |                  |               |               |
| 194 | Jenkins                                      |      |                  |               |               |
| 195 | TeamCity                                     |      |                  |               |               |
| 196 | Bamboo (Atlassian)                           |      |                  |               |               |
| 197 | GitLab CI/CD                                 |      |                  |               |               |
| 198 | CodeBuild (AWS)                              |      |                  |               |               |
| 199 | Azure DevOps                                 |      |                  |               |               |
| 200 | [Drone.io](http://Drone.io)                  |      |                  |               |               |
| 201 | Semaphore                                    |      |                  |               |               |
| 202 | Heroku                                       |      |                  |               |               |
| 203 | Vercel                                       |      |                  |               |               |
| 204 | Netlify                                      |      |                  |               |               |
| 205 | Render                                       |      |                  |               |               |
| 206 | Fastly                                       |      |                  |               |               |
| 207 | Akamai                                       |      |                  |               |               |
| 208 | Cloudflare                                   |      |                  |               |               |
| 209 | CDN77                                        |      |                  |               |               |
| 210 | Incapsula                                    |      |                  |               |               |
| 211 | Imperva                                      |      |                  |               |               |
| 212 | StackPath                                    |      |                  |               |               |
| 213 | Replika                                      |      |                  |               |               |
| 214 | Upstash                                      |      |                  |               |               |
| 215 | Aiven for Redis                              |      |                  |               |               |
| 216 | Aerospike                                    |      |                  |               |               |
| 217 | TimescaleDB                                  |      |                  |               |               |
| 218 | QuestDB                                      |      |                  |               |               |
| 219 | ScyllaDB                                     |      |                  |               |               |
| 220 | Memcached                                    |      |                  |               |               |
| 221 | Microsoft Azure Cache for Redis              |      |                  |               |               |
| 222 | Pivotal GemFire                              |      |                  |               |               |
| 223 | Amazon ElastiCache                           |      |                  |               |               |
| 224 | Google Cloud Memorystore                     |      |                  |               |               |
| 225 | IBM Cloud Databases for Redis                |      |                  |               |               |
| 226 | Redis Enterprise (Redis Labs)                |      |                  |               |               |
| 227 | MemSQL                                       |      |                  |               |               |
| 228 | CrateDB                                      |      |                  |               |               |
| 229 | IBM Db2 Warehouse                            |      |                  |               |               |
| 230 | Greenplum Database                           |      |                  |               |               |
| 231 | Citus (PostgreSQL extension)                 |      |                  |               |               |
| 232 | SingleStore                                  |      |                  |               |               |
| 233 | Exasol                                       |      |                  |               |               |
| 234 | Yellowbrick Data Warehouse                   |      |                  |               |               |
| 235 | CockroachDB                                  |      |                  |               |               |
| 236 | NuoDB                                        |      |                  |               |               |
| 237 | YugabyteDB                                   |      |                  |               |               |
| 238 | Aqua Data Studio                             |      |                  |               |               |
| 239 | SQLyog                                       |      |                  |               |               |
| 240 | dbForge Studio                               |      |                  |               |