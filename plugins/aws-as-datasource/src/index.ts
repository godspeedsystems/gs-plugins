import { GSContext,  GSDataSource, GSStatus, PlainObject,} from "@godspeedsystems/core";
import { S3 } from '@aws-sdk/client-s3';

export default class DataSource extends GSDataSource {
protected async initClient(): Promise<object> {
  const s3client = new S3({
    region: `${this.config.region}`,
    credentials: {
      accessKeyId: `${this.config.accessKeyId}`,
      secretAccessKey: `${this.config.secretAccessKey}`,
    },
  });
  return s3client;
}

async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    
  try {
    const {
      params,
      meta: { fnNameInWorkflow },
    } = args;
    const methodName = fnNameInWorkflow.split('.')[2];
    const ds = fnNameInWorkflow.split('.')[1];
    const client = this.client;

    if (client) {
      if (typeof client[methodName] === 'function') {
        const response = await client[methodName](params);
        return response;
      } else {
        return `Method '${methodName}' does not exist on the ${ds} s3-Client.`;
      }
    } 
  } catch (error) {
    return error;
  }
}
}
const SourceType = 'DS';
const Type = "aws"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "aws"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}