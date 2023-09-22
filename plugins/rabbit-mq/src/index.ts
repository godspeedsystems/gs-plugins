import { GSContext, GSDataSource, PlainObject, GSCloudEvent, GSStatus, GSActor } from "@godspeedsystems/core";
import { GSDataSourceAsEventSource } from "@godspeedsystems/core/dist/core/_interfaces/sources";

const amqplib = require('amqplib');


class DataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    const conn = await amqplib.connect(this.config.rabbitMqURL, { clientProperties: { ...this.config.rabbitMqClientProperties } });

    return conn
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const {
        queue,
        content,
        meta: { fnNameInWorkflow },
      } = args;
      let method = fnNameInWorkflow.split(".")[2];
      if (this.client) {
        if (method === "producer") {
          const channel = await this.client.createChannel();

          await channel.assertQueue(queue, { durable: false });

          // NB: `sentToQueue` and `publish` both return a boolean
          // indicating whether it's OK to send again straight away, or
          // (when `false`) that you should wait for the event `'drain'`
          // to fire before writing again. We're just doing the one write,
          // so we'll ignore it.
          channel.sendToQueue(queue, Buffer.from(content));
          await channel.close();

          return "Success";
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
    const queue = eventKey.split('.')[1];
    const groupId = eventKey.split(".")[2];
    interface mesresp {
      topic: string;
      partition: number;
      message: any;
    }

    if (client) {
      const channel = await client.createChannel();
      await channel.assertQueue(queue, { durable: false });
      await channel.consume(queue, async (message: any) => {
        console.log(" [x] Received '%s'", message.content.toString());
        let msgValue = message.content.toString();
        let data = {
          body: msgValue,
        };
        const event = new GSCloudEvent(
          "id",
          `${ds}.${queue}.${groupId}`,
          new Date(message.timestamp),
          "rabbit-mq",
          "1.0",
          data,
          "messagebus",
          new GSActor("user"),
          ""
        );
        const res = await processEvent(event, eventConfig);

        return res;

      }, { noAck: true });
    }
  }
}

const SourceType = 'BOTH';
const Type = 'rabbit-mq'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'rabbit-mq'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  EventSource,
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};
