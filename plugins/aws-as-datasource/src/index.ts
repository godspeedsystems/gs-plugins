import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
// import { DynamoDB } from "@aws-sdk/client-dynamodb";

export default class AWSDataSource extends GSDataSource {
  async initClient(): Promise<PlainObject> {
    const client = await this.initializeClients();
    return client;
  }
  /**
   * Config will allow multiple clients initializations of the each type of service
   * 
   * For ex. A sample aws services config
   * 
   * ```yaml
   * type:aws
   * default_client_config: # default config. Config will be given. As per AWS sdk API specs
   * services:
   *  s3_1:
   *    type: s3
   *    config: #will override default
   *  s3_2:
   *    type: s3
   *  dynamodb:
   *    type: dynamodb
   * ```
   */
  async initializeClients(): PlainObject {
    const dsConfig: PlainObject = (this as GSDataSource).config;
    const serviceModules: PlainObject = {};
    const clients: PlainObject = {};
    if (!dsConfig.services) {
      throw new Error(`The AWS datasource config in ${dsConfig.name}.yaml does not have any services declared under the key 'services'`);
    }
    for (let serviceName in Object.keys(dsConfig.services)) {
      const serviceConfig = dsConfig.services[serviceName];
      const serviceType = serviceConfig.type;
      if (!serviceType) {
        throw new Error(`The AWS datasource config in ${dsConfig.name}.yaml does not define service 'type' for serviceName ${serviceName}. Define the type of service like s3, dynamodb etc`);
      }
      let serviceModule = serviceModules[serviceType];
      if (!serviceModule) {
        serviceModule = await import(`@aws-sdk/client-${serviceType}`);
        serviceModules[serviceType] = serviceModule;
      }
      const Constructor = serviceModule.default;
      const serviceClient = new Constructor(serviceConfig.config || dsConfig.default_client_config);
      clients[serviceName] = serviceClient;
    }
    return clients;
  }

  /**
   * The `fnNameInWorkflow` arg represets the `fn` name which is like
   * `datasource.<aws_instance_name>.<service_name>.<method_name>`
   * For ex. `datasource.aws.s3_1.createTable`
   * @param ctx 
   * @param args 
   * @returns 
   */
  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    const {
      meta: { fnNameInWorkflow },
      ...rest
    } = args;
    try {
      
      // fn validity checks
      const fnParts = this.isFnValid(fnNameInWorkflow, ctx);
      if (!fnParts) {
        throw new Error();
      }

      let [, , serviceName, method] = fnParts;
      const serviceClient = (this as GSDataSource).client[serviceName];

      if (typeof serviceClient[method] === 'function') {
        const response = await serviceClient[method](rest);
        throw new Error();
      } else {
        ctx.childLogger.error(`Invalid AWS method called for service ${serviceName}`);
        throw new Error();
      }
    } catch (error: any) {
      ctx.childLogger.error(`Error encountered in executing ${fnNameInWorkflow}. ${error}`);
      return new GSStatus(false, error.$metadata?.httpStatusCode || 500, undefined, { message: "Internal server error" });
    }
  }

  isFnValid(fnNameInWorkflow: string, ctx: GSContext): string[] | undefined {
    if (!fnNameInWorkflow) {
      ctx.childLogger.error("fn can not be null or undefined");
      return;
    }
    const fnParts: string[] = fnNameInWorkflow.split('.');
    if (fnParts.length !== 4) {
      ctx.childLogger.error("Invalid aws datasource fn. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
      return;
    }
    let [, , serviceName, method] = fnParts;
    if (!serviceName) {
      ctx.childLogger.error("Invalid aws datasource fn. Service name not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
      return;
    }
    if (!method) {
      ctx.childLogger.error("Invalid aws datasource fn. Method's name Not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
      return;
    }

    return fnParts;
  }
  
}

export {
  AWSDataSource as DataSource,
};
