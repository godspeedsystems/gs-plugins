import {PlainObject, GSDataSource} from "@godspeedsystems/core"
import { Consumer, Kafka, Producer, logLevel as kafkaLogLevel } from 'kafkajs';

class KafkaDataSource extends GSDataSource{
  async initClient(): Promise<PlainObject>{

  }
}