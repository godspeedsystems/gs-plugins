import { GSContext, GSDataSource, GSStatus, PlainObject, } from "@godspeedsystems/core";
const os1Api = require('./os1');
// const tenantId = process.env.X_COREOS_TID || "";
// const token = process.env.X_COREOS_ACCESS || "";
// const appId = process.env.X_COREOS_APPID || "";

class DataSource extends GSDataSource {

  private services: PlainObject = {};

  protected async initClient(): Promise<object> {
    //const {tenantId, appId} = this.config;
    //const token = process.env.X_COREOS_ACCESS; //TODO load this by hitting the API on 401 error
    return this.services;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const {
      meta: { entityType: serviceName, method },
      ...rest
    } = args;
    const {childLogger} = ctx;
   // const {tenantId, access, appId, originToken} = ctx.config;//from custom-environment-variables

    try {
      childLogger.debug('calling OS1 datasource service %s method %s args %o', serviceName, method, rest);
      const res = await this.executeMethod(serviceName, method, ctx, rest);
      return new GSStatus(true, 200, undefined, res.data);
    } catch (error: any) {
      childLogger.error('Error in executing os1 datasource service %s method %s args %o error message %s error stack %o', serviceName, method, args, error.message, error.stack);
      return new GSStatus(false, error.response.status || 500, error.code, {error: error.response.data});
    }
  }

  getServiceInstance(serviceName: string): any {
    let service = this.services[serviceName];
    if (!service) { //initialize the service instance
      const Constructor = os1Api[serviceName];
      service = new Constructor();
      this.services[serviceName] = service;
    }
    return service;
  }
  async executeMethod(serviceName: any, method: string, ctx: GSContext, args: PlainObject): Promise<any> {
    let service = this.getServiceInstance(serviceName);
    const apiFn = service[method];
    const argsArray = getArgsAsArray(apiFn, ctx, args);
    //const {config: {tenantId, appId, token}} = ctx;
    return await service[method](...argsArray);//requestId, tenantId, token, appId, token, 
  }
  
}
const ENV_VARS: PlainObject = {
  'xCOREOSTID': 'tenantId', 
  'xCOREOSACCESS': 'token', 
  'appId': 'appId', 
  'xCOREOSORIGINTOKEN': 'token'
};

function getArgsAsArray(apiFn: Function, ctx: GSContext, args: PlainObject): any[] {
  const argNamesArray: any[] = getParamNames(apiFn);
  const argsArray = [];

  for (let argName of argNamesArray) {
    //Load the value of the argument from env vars or from args whereever it is located
    let argValue;

    if (ENV_VARS[argName]) {
    
      const envVar = ENV_VARS[argName];
      argValue = ctx.config[envVar];
    
    } else if (argName === 'xCOREOSREQUESTID') {
      argValue = args['requestId'] || "";

    } else {
      argValue = args[argName];
    }

    argsArray.push(argValue);
  }
  return argsArray;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func: Function) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result: string[] | null = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

const SourceType = 'DS';
const Type = "delhivery-os1-datasource"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "delhivery-os1-datasource"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
