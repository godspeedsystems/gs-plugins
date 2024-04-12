import { GSContext, GSCachingDataSource, PlainObject, GSStatus, RedisOptions } from "@godspeedsystems/core";
import { createClient } from "redis";

export default class DataSource extends GSCachingDataSource {
protected async initClient(): Promise<object> {
  const client = await createClient({
    url: this.config.url
  }) as any; 
  client.on("error", (err:any) => console.log("Redis Client Error", err)); 
  await client.connect();
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
          } catch(err){
            return new GSStatus(false, 500, 'Get operation failed', err, undefined);
          }
        }
      }
    } catch (error) {
      return new GSStatus(false, 500, 'Internal server error', error , undefined)
    }
  }

  async set(key:string, val: any, options: RedisOptions) {
    try {
      const client = this.client;
      if (client) {
        try{
          const res = await client.set(key, val, options);
          return new GSStatus(true, 201, 'Set operation successful', res, undefined);
        } catch(err){
          return new GSStatus(false, 500, 'Set operation failed', err, undefined);
        }
      }
    } catch (error) {
      return new GSStatus(false, 500, 'Internal server error', error , undefined)
    }
  }

  async get(key:string): Promise<any> {
    try {
      const client = this.client;
      if (client) {
        try{
          const res = await client.get(key);
          return res;
        } catch(err){
          return null;
        }
      }
    } catch (error) {
      return null;
    }
  }

  async del(key:string) {
    try {
      const client = this.client;
      if (client) {
        try{
          const res = await client.del(key);
          return new GSStatus(true, 202, 'Del operation successful', res, undefined);
        } catch(err){
          return new GSStatus(false, 500, 'Del operation failed', err, undefined);
        }
      }
    } catch (error) {
      return new GSStatus(false, 500, 'Internal server error', error , undefined)
    }
  }
}
const SourceType = "DS";
const Type = "redis"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "redis"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {type: "redis",
  url: "redisUrl:port"};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
