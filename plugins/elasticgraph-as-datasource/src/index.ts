import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
  logger
} from "@godspeedsystems/core";
import path from "path";
const ElasticGraph = require("@godspeedsystems/elasticgraph");

const responseCodes: { [key: string]: number } = {
  index: 201,
  get: 200,
  update: 204,
  delete: 202,
  search: 200,
  mget: 200,
  msearch: 200,
  bulk: 204,
};
export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const { name } = this.config;
    try {
      const configPath = path.join(process.cwd(), 'dist/datasources/', name, '/config');
      return new ElasticGraph(configPath, logger);
      // elasticsearch client eg.
      // return new Client({
      //   apiVersion: '7.17.18',
      //   maxConnections: 200,
      //   node: 'http://localhost:9200/',
      //   requestTimeout: 3000,
      //   sniffOnStart: true
      // });
    } catch (error) {
      throw error;
    }
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    try {
      const {
        meta: {fnNameInWorkflow },
        ...rest
      } = args as {
        meta: { entityType: string; method: string; fnNameInWorkflow: string };
      };
      logger.fatal(rest);
      const {index, method} = getEtAndMethod(fnNameInWorkflow);

      const { deep, collect } = this.config;

      if (this.client) {
        let fn: any;
        if (deep === true) {
          // In case this method has deep function use that else use native call
          fn = this.client.deep[method] || this.client[method];
        } else if (collect === true) {
          // In case this method has collect function use that else use native call
          fn = this.client[method]?.collect || this.client[method];
        } else {
          fn = this.client[method];
        }
        let egResponse = await fn({
          index,
          // type: '_doc',
          ...rest
        });
        return new GSStatus(true, responseCodes[method], undefined, egResponse);
      } else {
        throw new Error('Elasticgraph client not initialized')
      }
    } catch (error: any) {
      logger.error('Error in executing elasticgraph query \n args %o \n error %o', args, error);
      return new GSStatus(false, 500, error.message, {error});
    }
  }
}

function getEtAndMethod(fnNameInWorkflow: string): PlainObject {
  const fnSplit = fnNameInWorkflow.split('.');

  return {
    index: fnSplit[2],
    method: fnSplit[3]
  };
}

const SourceType = "DS";
const Type = "elasticgraph";
const CONFIG_FILE_NAME = "elasticgraph";
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
