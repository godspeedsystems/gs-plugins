import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from "@godspeedsystems/core";
import { createClient } from "redis";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const client = await createClient({
      url: this.config.url
    })
      .on("error", (err) => console.log("Redis Client Error", err))
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
          const res = await client.set(args.key, args.value);
          return res;
        } else if (methodName === "get") {
          const res = client.get(args.key);
          return res;
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
const SourceType = "DS";
const Type = "radis"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "radis"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
