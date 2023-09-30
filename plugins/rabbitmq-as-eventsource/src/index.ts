import { GSStatus, PlainObject, GSEventSource, GSCloudEvent } from "@godspeedsystems/core";
import { connect, Channel, Connection } from 'amqplib'

class EventSource extends GSEventSource {
  async initClient(): Promise<PlainObject> {
    const {
      hostname = 'localhost',
      port = 5672,
      username = null,
      password = null
    } = this.config;

    const credentials = username === null ? '' : password === null ? username : `${username}:${password}`
    const url = `amqp://${credentials}@${hostname}:${port}`
    let connection: Connection, channel: Channel
    try {
      connection = await connect(url) as Connection;
      channel = await connection.createChannel() as Channel;
    } catch (error) {
      console.log(`something went wrong: ${error}`)
      throw error;
    }

    return channel
  }

  async subscribeToEvent(eventKey: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>): Promise<void> {
    // eventKey of the form {type="rabbitmq"}.{exchange_name}.{queue_name}.{type=["producer" | "consumer"]}
    const [, exchange_name = "gs_rabbitmq", queue_name = "messages", type] = eventKey.split(".");
    const message: string = eventConfig.message;

    const channel = this.client;
    if (!channel) {
      return;
    }

    const exchange_type: string = 'fanout';

    if (type.toLowerCase() === "producer") {
      // producer code
      try {
        await channel.assertExchange(exchange_name, exchange_type, {
          durable: false
        });
        await channel.assertQueue(queue_name, { durable: false });
        channel.sendToQueue(queue_name, Buffer.from(message));
        console.log(`Message sent : ${message}`);
      } catch (error) {
        console.log(`something went wrong : ${error}`);
        throw error;
      }
    } else if (type.toLowerCase() === "consumer") {
      // consumer code
      try {
        await channel.assertExchange(exchange_name, exchange_type, {
          durable: false,
        });
        const q = await channel.assertQueue(queue_name, { durable: false });
        const binding_key = "";
        channel.bindQueue(q.queue, exchange_name, binding_key);
        channel.consume(q.queue, (msg: PlainObject) => {
          console.log(`Message received ${msg?.content?.toString()}`);
          channel.ack(msg);
        })
      } catch (error) {
        console.log(`something went wrong : ${error}`);
        throw error;
      }
    }
  }
}

const SourceType = 'ES';
const Type = 'rabbitmq';
const CONFIG_FILE_NAME = 'rabbitmq';
const DEFAULT_CONFIG = {
  hostname: 'localhost',
  port: 5672
};

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}