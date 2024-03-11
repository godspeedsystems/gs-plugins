import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
export default class DataSource extends GSDataSource {
  // rand = Math.random();
  // isSecondHit: boolean = false;
  tokenRefreshPromise: Promise<any> | null = null;
  // refreshCount = 0;
  // refreshingCount = 0;
  // waitAndHitCount = 0;
  // successCount = 0;
  // attemptsCount = 0;
  protected async initClient(): Promise<PlainObject> {
    const { base_url, timeout, headers, authn } = this.config;
    //For token refresh logic, if authn key is present, configure the refresh logic
    if (authn) {
      //Set status codes to refresh on, if customLogic for refresh check is not set
      if (!authn.refreshOn?.customLogic) {
        //set the status code to refresh on
        let defaultCodes = authn.refreshOn?.statusCode;
        authn.refreshOn = authn.refreshOn || {};
        if (!defaultCodes) {
          authn.refreshOn.statusCode = [401];
        } else if (Array.isArray(defaultCodes) && defaultCodes.length === 0) {
          authn.refreshOn.statusCode = [401]
        } else if (typeof defaultCodes === 'number') {
          authn.refreshOn.statusCode = [defaultCodes];
        }
      }
      //initialize the authentication function
      const fnPath = this.config.authn.fn.replaceAll('\.', '/');
      this.config.authn.fn = require(`${process.cwd()}/dist/functions/${fnPath}`);
      //initialize token headers
      await this.setAuthHeaders();
    }
    const client = axios.create({ baseURL: base_url, timeout, headers });

    if (this.config.curlifiedLogs) {
      const curlirize = require('./curlize');
      curlirize(client);
    }

    return client;
  };

  private setRetry(client: AxiosInstance, retryConf: PlainObject, ctx: GSContext) {
    const { max_attempts = 1, type = 'constant', interval = 'PT10s', min_interval = 'PT5s', max_interval = 'PT15s' } = retryConf;

    axiosRetry(client, {
      retries: max_attempts,
      retryDelay: (
        retryNumber: number,
        error: AxiosError<any, any>,
      ) => {
        switch (type) {
          case 'constant':
            ctx.childLogger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & interval - ${interval}. Error: ${error.message}`);
            return interval;

          case 'random':
            let min = Math.ceil(min_interval);
            let max = Math.floor(max_interval);
            ctx.childLogger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & calculated interval - ${Math.floor(Math.random() * (max + 1 - min) + min)}.  Error: ${error.message}`);

            return Math.floor(Math.random() * (max + 1 - min) + min);

          case 'exponential':
            const delay = 2 ** retryNumber * interval;
            const randomSum = delay * 0.2 * Math.random();
            ctx.childLogger.info(`Attempt ${retryNumber}: Retrying request with ${type} retry delay & interval - ${interval}. Error: ${error.message}`);
            return delay + randomSum;
        }
        return 0;
      },
      retryCondition: (error: any) => {
        // Allow developer to set custom status and message for retry
        // For example: 
        // message: Request failed with status code 500
        // status: 500

        if (!retryConf.when) {
          // There is no special condition to retry
          // Always retry upon error (500 status)
          return true;
        }

        const retryCondition = retryConf.when;
        // Response status must be one of the retry statuses configured
        if (retryCondition.status && !retryCondition.status.includes( error.response?.status)) {
          return false;
        }
        // Error message if given must match the message in the condition
        if (retryCondition.message && retryCondition.message !== error.message) {
          return false;
        }
        // All conditions matched, so let's retry
        return true;
      },
    });
  }

  async execute(ctx: GSContext, args: PlainObject, retryCount = 0): Promise<any> {
    // ++this.attemptsCount;
    const baseURL = this.config.base_url;
    let retryConf = {...this.config.retry,...args.retry}
    let {
      meta: { fnNameInWorkflow, method, url },
      data,
      headers,
      ...rest //the remaining arguments of the axios call
    } = args;

    if (fnNameInWorkflow) {
      let urlParts;
      [, , method, ...urlParts] = fnNameInWorkflow.split('.');
      url = urlParts.join('.');
    }
    if (!method || !url) {
      return new GSStatus(false, 400, 'method or url not found in axios call', fnNameInWorkflow || {method, url});
    }


    try {
      if (this.tokenRefreshPromise && !args.skipAuth) {
        // ++this.waitAndHitCount;
        await this.tokenRefreshPromise;
      }

      const client = this.client as AxiosInstance;
      
      if(Object.keys(retryConf).length !== 0){
        this.setRetry(client,retryConf,ctx);
      }
      //Hit the API with headers
      headers = this.setHeaders(headers);

      const query = {
        method: method.toLowerCase(),
        url,
        baseURL,
        headers,
        data: JSON.stringify(data),
        ...rest
      };
      //For testing auth refresh in concurrenct scenarios
      // if (!this.isSecondHit) {
      //   this.isSecondHit = true;
      //   delete this.config.headers['X-COREOS-ACCESS'];
      //   delete this.config.headers['X-COREOS-ORIGIN-TOKEN'];
      //   ctx.childLogger.error('unset')
      // };

      let response = await client(query);
      // ++this.successCount;
      return new GSStatus(true, response.status, response.statusText, response.data, response.headers);
    } catch (error: any) {
      let { response } = error;
      // ctx.childLogger.fatal('attempts %s success %s waitAndHit %s refresh %s refreshing %s', this.attemptsCount, this.successCount, this.waitAndHitCount, this.refreshCount, this.refreshingCount);

      if (!response) {
        //Some random error occured. Not axios error.
        return new GSStatus(false, 503, error.message, { error });
      }
      // axios request failed

      if (!this.config.authn) {
        const { status, data: { message }, headers } = response as AxiosResponse;
        return new GSStatus(false, status, message, response.data, headers);
      }

      //Check if this is an authentication error.
      let handleAuthnFailure: boolean = this.config.authn && this.isAuthFailed(response);
      //If auth failed we need to refresh the token (if process not already initiated) 
      //and wait while it is being refreshed
      if (handleAuthnFailure) {
        if (!this.tokenRefreshPromise) {
          // ++this.refreshCount
          this.startTokenRefresh(ctx);
          //Wait for auth token(s) to be refreshed
          try {
            await this.tokenRefreshPromise;
          } catch (err) {
            return new GSStatus(false, 500, error.message, 'Internal Server Error');
          }
        } else {
          // ++this.refreshingCount;
          //Wait for auth token(s) to be refreshed
          try {
            await this.tokenRefreshPromise;
          } catch (err) {
            return new GSStatus(false, 500, error.message, 'Internal Server Error');
          }
        }

        //Try the API call again now
        return await this.execute(ctx, args);
      } else {
        // ++this.successCount;
        //This is a non-auth axios error
        const { status, data: { message }, headers } = response as AxiosResponse;
        return new GSStatus(false, status, message, response.data, headers);
      }

    }
  }

  setHeaders(headers: PlainObject): PlainObject {
    if (!headers) {
      return this.config.headers;
    }

    //Next remove null value header keys
    Object.keys(headers).forEach((header) => {
      if (!headers[header]) {
        delete headers[header];
      }
    });
    // Create and return final headers with default values from this.config.headers
    return Object.assign({}, this.config.headers, headers);

  }

  isAuthFailed(response: AxiosResponse) {
    const authn = this.config.authn;

    const tokenRefreshFn = authn.refreshOn.customLogic;
    //If token refresh function is present, we will use that instead of status code check
    if (tokenRefreshFn) {
      if (tokenRefreshFn(response) === true) {
        return true;
      }
    } else { //check status code of response
      const statusCodes: number[] = authn.refreshOn.statusCode;
      if (statusCodes.includes(response.status)) {
        return true;
      }
    }
    return false;
  }
  startTokenRefresh(ctx: GSContext) {
    const that = this;
    //Inititialize this promise so that other concurrent requests dont start refreshing the token in parallel
    this.tokenRefreshPromise = new Promise(async (resolve, reject) => {
      //Get and set new access headers
      try {
        await that.setAuthHeaders();
        //set this to null so that next request can directly be executed with newly set auth headers
        that.tokenRefreshPromise = null;
        //resolve this promise so that those waiting can continue further
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  }
  async setAuthHeaders() {
    const authnHeaders: PlainObject = await this.config.authn.fn(this.config);
    Object.assign(this.config.headers, authnHeaders);
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

