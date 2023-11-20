import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from "@godspeedsystems/core";
const ElasticGraph = require("@godspeedsystems/elasticgraph");

function responseCode(method: string): number {
  return response_codes[method] || 200;
}

const response_codes: { [key: string]: number } = {
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
    const { schema_backend } = this.config;
    try {
      const eg = new ElasticGraph(schema_backend);
      return eg;
    } catch (error) {
      throw error;
    }
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    try {
      const {
        meta: { entityType, method, fnNameInWorkflow },
        data,
      } = args as {
        meta: { entityType: string; method: string; fnNameInWorkflow: string };
        data: PlainObject;
      };

      const { deep, collect } = this.config;

      if (this.client) {
        let client: any;
        if (deep === true) {
          client = this.client.deep;
        } else {
          client = this.client;
        }

        if (collect === true && deep === false) {
          let egResponse = await client[method].collect({
            ...data,
          });
          return Promise.resolve(
            new GSStatus(true, responseCode(method), undefined, egResponse)
          );
        } else {
          let egResponse = await client[method]({
            ...data,
          });
          return Promise.resolve(
            new GSStatus(true, responseCode(method), undefined, egResponse)
          );
        }
      }
    } catch (error: any) {
      logger.error(error);
      return Promise.reject(
        new GSStatus(false, 400, error.message, JSON.stringify(error.message))
      );
    }
  }
}

const SourceType = "DS";
const Type = "elasticgraph";
const CONFIG_FILE_NAME = "elasticgraph";
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
