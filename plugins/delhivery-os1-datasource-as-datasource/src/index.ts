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
      requestId = "",
      ...rest
    } = args;
    const {childLogger, config: {tenantId, access, appId, token}} = ctx;
   // const {tenantId, access, appId, originToken} = ctx.config;//from custom-environment-variables

    let service = this.getServiceInstance(serviceName);
    try {
      childLogger.error('called datasource %s %o', serviceName, rest);

     const res = await service[method](requestId, tenantId, token, appId, token, rest);
      return new GSStatus(true, 200, undefined, res.data);
    } catch (error: any) {
      childLogger.error('Error in executing os1 %o', error);
      return new GSStatus(false, 500, error.message, {error: error});
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
