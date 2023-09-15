import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import axios, { Axios, AxiosInstance, AxiosResponse } from 'axios'

class DataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    const { base_url, ...rest } = this.config;

    const client = axios.create({ baseURL: base_url, ...rest });
    return client;

  }
  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    const {
      meta: { fnNameInWorkflow },
      ...rest
    } = args as { meta: { entityType: string, method: string, fnNameInWorkflow: string }, rest: PlainObject };

    const [, , method, url] = fnNameInWorkflow.split('.');

    try {
      const client = this.client as AxiosInstance;

      const response = await client({
        method: method.toLowerCase(),
        url,
        ...rest
      });

      return new GSStatus(true, response.status, response.statusText, response.data, response.headers);
    } catch (error: any) {
      const { request, response } = error;

      // request initilized but failed
      if (response) {
        const { status, data: { message }, headers } = response as AxiosResponse;
        return new GSStatus(false, status, message, undefined, headers)
      }

      // request sent but no response received
      if (request) {
        return new GSStatus(false, 503, 'Server timeout.', undefined, undefined);
      }

      return new GSStatus(false, 500, 'Oops! Something went wrong while setting up request.', undefined, undefined);
    }
  }
}


const SourceType = 'DS';
const Type = 'axios'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'api'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}