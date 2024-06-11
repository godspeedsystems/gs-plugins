import { GSContext, GSDataSource, PlainObject, GSDataSourceAsEventSource, GSCloudEvent, GSStatus, GSActor } from "@godspeedsystems/core";
import { Kafka, logLevel } from "kafkajs";
import fs from 'fs';
import path from 'path';

class DataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    const kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers,
      ssl: {
        rejectUnauthorized: false, // optional, depends on your requirements
        key: fs.readFileSync(path.resolve(this.config.ssl.key)),
        cert: fs.readFileSync(path.resolve(this.config.ssl.cert)),
        ca: [fs.readFileSync(path.resolve(this.config.ssl.ca))],
        passphrase: this.config.ssl.passphrase, // optional, if your key has a passphrase
      },
      logLevel: logLevel.INFO, // optional, for logging
    });

    return kafka;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const {
        topic,
        message,
        meta: { fnNameInWorkflow },
      } = args;
      let method = fnNameInWorkflow.split(".")[2];
      if (this.client) {
        if (method === "producer") {
          const producer = this.client.producer();
          await producer.connect();
          let result = await producer.send({
            topic: topic,
            messages: [{ value: JSON.stringify(message) }],
          });
          await producer.disconnect();
          return result;
        } else {
          return "Invalid method";
        }
      }
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

    const client = this.client;
    const ds = eventKey.split(".")[0];
    const groupId = eventKey.split(".")[2]
    const _topic = eventKey.split('.')[1];
    interface mesresp {
      topic: string;
      partition: number;
      message: any;
    }

    if (client) {
      const consumer = client.consumer({ groupId: groupId });
      await consumer.subscribe({
        topic: _topic,
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async (messagePayload: mesresp) => {
          const { message } = messagePayload;
          let msgValue;
          let status;
          let data;
          try {
            msgValue = message?.value?.toString();
            data = {
              body: JSON.parse(msgValue || ''),
            };
            status = 200;
          } catch (ex) {
            status = 500;
            return new GSStatus(
              false,
              500,
              `Error in parsing kafka event data ${msgValue}`,
              ex
            );
          }
          const event = new GSCloudEvent(
            "id",
            `${ds}.${_topic}.${groupId}`,
            new Date(message.timestamp),
            "kafka",
            "1.0",
            data,
            "messagebus",
            new GSActor("user"),
            ""
          );
          const res = await processEvent(event, eventConfig);

          if (!res) {
            status = 500;
          } else {
            status = 200;
          }
          return res;
        },
      });
    }
  }
}

const SourceType = 'BOTH';
const Type = "kafka"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "kafka"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
  type: "kafka",
  clientId: "kafka_proj",
  brokers: ["kafka:9092"],
  log: { attributes: { eventsource_type: "kafka" } }
};

export {
  DataSource,
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
