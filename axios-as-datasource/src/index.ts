import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import axios, { Axios, AxiosError, AxiosInstance, AxiosResponse } from 'axios'

export class AxiosAsDatasource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    const { base_url } = this.config;

    const client = axios.create({ baseURL: base_url });
    return client;

  }
  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    const {
      meta: { fnNameInWorkflow },
      ...data
    } = args as { meta: { entityType: string, method: string, fnNameInWorkflow: string }, rest: PlainObject };

    const [, , method, url] = fnNameInWorkflow.split('.');

    try {
      const client = this.client as AxiosInstance;

      const response = await client({
        method: method.toLowerCase(),
        url,
        data: data
      });

      return response;
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
