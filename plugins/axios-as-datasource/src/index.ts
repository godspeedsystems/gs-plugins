import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import axios, { Axios, AxiosInstance, AxiosResponse , AxiosError } from 'axios'
import axiosRetry from 'axios-retry';

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

      if (args.retry) {
        const { max_attempts = 1, type = 'constant', interval = 'PT10s', min_interval = 'PT5s', max_interval = 'PT15s'} = args.retry;

        axiosRetry(client, {
          retries: max_attempts,
          retryDelay:(
            retryNumber: number,
            error: AxiosError<any, any>,
          )=> {
            switch (type) {
              case 'constant':
                logger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & interval - ${interval}. Error: ${error.message}`);
                return interval;
      
              case 'random':
                let min = Math.ceil(min_interval);
                let max = Math.floor(max_interval);
                logger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & calculated interval - ${Math.floor(Math.random() * (max + 1 - min) + min)}.  Error: ${error.message}`);

                return Math.floor(Math.random() * (max + 1 - min) + min);
      
              case 'exponential':
                const delay = 2 ** retryNumber * interval;
                const randomSum = delay * 0.2 * Math.random();
                logger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & interval - ${interval}. Error: ${error.message}`);
                return delay + randomSum;
            }
            return 0;
          },
          retryCondition: (error: any) => {
            // Allow developer to set custom status and message for retry
            // For example: 
            // message: Request failed with status code 500
            // status: 500

            if(!args.retry.if) {
              // There is no special condition to retry
              // Always retry upon error (500 status)
              return true;
            }

            const retryIf = args.retry.if;
           
            if (retryIf.status && retryIf.status !== error.response?.status) {
              return false;
            }
            if (retryIf.message && retryIf.message !== error.message) {
              return false;
            }
            // All conditions matched, so let's retry
            return true;
          },
        });
      } 

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
