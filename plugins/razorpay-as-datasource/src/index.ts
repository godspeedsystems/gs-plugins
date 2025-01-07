import { GSContext,  GSDataSource, GSStatus, PlainObject,} from "@godspeedsystems/core";

export default class DataSource extends GSDataSource {
protected async initClient(): Promise<object> {
     // initialize your client
}

async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    
    try {
      // execute methods
      
    } catch (error) {
      throw error;
    }
}
}
const SourceType = 'DS';
const Type = "razorpay"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "razorpay"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
