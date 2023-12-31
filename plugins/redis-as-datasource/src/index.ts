import {
  GSContext,
  GSDataSource,
  PlainObject,
  GSStatus,
} from "@godspeedsystems/core";
import { createClient } from "redis";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const client = await createClient({
      url: this.config.url
    })
      .on("error", (err:any) => console.log("Redis Client Error", err))
      .connect();
    return client;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const {
        meta: { fnNameInWorkflow },
      } = args;
      const methodName = fnNameInWorkflow.split(".")[2];
      const ds = fnNameInWorkflow.split(".")[1];
      const client = this.client;

      if (client) {
        if (methodName === "set") {
          try{
            const res = await client.set(args.key, args.value);
            return new GSStatus(true, 200, 'Set operation successful', res, undefined);
          }catch(err){
            return new GSStatus(false, 500, 'Set operation failed', err, undefined);
          }
        } else if (methodName === "get") {
          try{
          const res = client.get(args.key);
          return new GSStatus(true, 200, 'Get operation successful', res, undefined);
        }catch(err){
          return new GSStatus(false, 500, 'Get operation failed', err, undefined);
        }
      }
    }
  }catch (error) {
    return new GSStatus(false, 500, 'Internal server error', error , undefined)
  }
}
}
const SourceType = "DS";
const Type = "redis"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "redis"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
