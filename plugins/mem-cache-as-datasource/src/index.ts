// import { GSContext, GSDataSource, PlainObject, GSStatus } from "@godspeedsystems/core";
import { GSContext, GSCachingDataSource, PlainObject } from "/home/gurjot/data/cli-test/gs-node-service";

export default class DataSource extends GSCachingDataSource {
  protected async initClient(): Promise<PlainObject> {
    this.client = {};
    return this.client;
  }  

  set(key: string, val: any, options: { EX?: number | undefined; PX?: number | undefined; EXAT?: number | undefined; NX?: boolean | undefined; XX?: boolean | undefined; KEEPTTL?: boolean | undefined; GET?: boolean | undefined; }) {
    console.log('set key %s %o', key, this.client)

    // @ts-ignore
    this.client[key] = val;
  }

  get(key: string) {
    // @ts-ignore
    return this.client[key];
  }

  del(key: string) {
    // @ts-ignore
    delete this.client[key];
  }

  execute(ctx: GSContext, args: PlainObject): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
const SourceType = "DS";
const Type = "mem-cache"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mem-cache"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
