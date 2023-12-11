import { GSContext,  GSDataSource, PlainObject} from "@godspeedsystems/core";
import * as AWS from "@aws-sdk/client-dynamodb";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
		const client = new AWS.DynamoDB({
			region: this.config.region,
			endpoint: this.config?.endpoint,
			credentials: {
				accessKeyId: this.config.accessKeyId,
				secretAccessKey: this.config.secretAccessKey,
			}
		});
		return client;
	}


	async execute(ctx: GSContext, args: PlainObject): Promise<any> {
		try {
			const {
				meta: { fnNameInWorkflow },
			} = args;
			const methodName = fnNameInWorkflow.split('.')[2];
			const ds = fnNameInWorkflow.split('.')[1];
			const client = this.client;
			if (client && typeof client[methodName] === 'function') {
				const response = await client[methodName](args.params);
				return response;
			} else {
				throw new Error(`Invalid method name: ${methodName}`);
			}
		} catch (error) {
			return error;
		}
	}
}
const SourceType = 'DS';
const Type = "dynamodb"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "dynamodb"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
