import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

interface DynamoDBConfig {
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  apiVersion?: string;
}

export default class DataSource extends GSDataSource {
    async initClient(): Promise<DynamoDB> {
    const client = new DynamoDB({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      apiVersion: this.config.apiVersion || 'latest'
    });
    return client;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    try {
      const {
        meta: { fnNameInWorkflow },
        ...rest
      } = args;
      const methodName = fnNameInWorkflow.substr(
        fnNameInWorkflow.lastIndexOf('.') + 1
      );

      const client = await this.client;
      if (client && typeof client[methodName] === 'function') {
        const response = await client[methodName](rest);
        return new GSStatus(true, response.$metadata.httpStatusCode, undefined, response, undefined);
      } else {
        return new GSStatus(false, 405, undefined, `Invalid method name: ${methodName}`, undefined);
      }
    } catch (error:any) {
      return new GSStatus(false, error.$metadata.httpStatusCode, "Internal server error", error, undefined);
    }
  }
}

const SourceType = 'DS';
const Type = "dynamodb";
const CONFIG_FILE_NAME = "dynamodb";
const DEFAULT_CONFIG: DynamoDBConfig = {
  region: '',
  accessKeyId: '',
  secretAccessKey: ''
};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};
