import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
//Some example client mappings. Developer should set the mappings of all 
//service types she needs in their datasource's instance's yaml file. 
//If she sets even one mapping. that is used, and this one is ignored.
const SERVICE_CLIENT_MAPPINGS: PlainObject = {
  dynamodb: 'DynamoDB',
  s3: 'S3',
  lambda: 'Lambda',
  ssm: 'SSM',
  sqs: 'SQS'
};

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


  async initializeClients(): Promise<PlainObject> {
    const dsConfig: PlainObject = (this as GSDataSource).config;
    const serviceModules: PlainObject = {};
    const clients: PlainObject = {};
    if (!dsConfig.services) {
      throw new Error(`The AWS datasource config in ${dsConfig.name}.yaml does not have any services declared under the key 'services'`);
    }
    const serviceClientMappings: PlainObject = (this as GSDataSource).config.types || SERVICE_CLIENT_MAPPINGS;
    for (let serviceName of Object.keys(dsConfig.services)) {
      const serviceConfig = dsConfig.services[serviceName];
      const serviceType = serviceConfig.type;
      if (!serviceType) {
        throw new Error(`The AWS datasource config in ${dsConfig.name}.yaml does not define service 'type' for serviceName ${serviceName}. Define the type of service like s3, dynamodb etc`);
      }
      let serviceModule = serviceModules[serviceType];
      if (!serviceModule) {
        const clientLibrary = await import(`@aws-sdk/client-${serviceType}`);
        serviceModule = clientLibrary[serviceClientMappings[serviceType]];
        serviceModules[serviceType] = serviceModule;
      }
      const Constructor = serviceModule;
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

      meta: { entityType: serviceName, method },
      ...rest
    } = args;
    try {
      // fn validity checks
      // const fnParts = this.isFnValid(fnNameInWorkflow, ctx);
      // if (!fnParts) {
      //   throw new Error();
      // }
      if (!serviceName) {
        ctx.childLogger.error("Invalid aws datasource fn. Service name not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
        return new GSStatus(false, 500, undefined, { message: "Internal server error" });
      }
      if (!method) {
        ctx.childLogger.error("Invalid aws datasource fn. Method's name Not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
        return new GSStatus(false, 500, undefined, { message: "Internal server error" });
      }
      // let [, , serviceName, method] = fnParts;
      //@ts-ignore
      const serviceClient = this.client && this.client[serviceName];

      if (!serviceClient) {
        ctx.childLogger.error(`Invalid AWS service name '${serviceName}'`);
        return new GSStatus(false, 500, undefined, { message: "Internal server error" });
      }

      if (typeof serviceClient[method] === 'function') {
        //Invoke the method
        const response = await serviceClient[method](rest);
        return new GSStatus(true, 200, undefined, response);
      } else {

        ctx.childLogger.error(`Invalid method '${method}' called for datasource.aws.${serviceName}`);
        return new GSStatus(false, 500, undefined, { message: "Internal server error" });
      }

    } catch (error: any) {
      ctx.childLogger.error(`Error encountered in executing ${serviceName}.${method}. ${error}`);
      return new GSStatus(false, error.$metadata?.httpStatusCode || 500, undefined, { message: "Internal server error" });
    }
  }

  // isFnValid(fnNameInWorkflow: string, ctx: GSContext): string[] | undefined {
  //   if (!fnNameInWorkflow) {
  //     ctx.childLogger.error("fn can not be null or undefined");
  //     return;
  //   }
  //   const fnParts: string[] = fnNameInWorkflow.split('.');
  //   if (fnParts.length !== 4) {
  //     ctx.childLogger.error("Invalid aws datasource fn. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
  //     return;
  //   }
  //   let [, , serviceName, method] = fnParts;
  //   if (!serviceName) {
  //     ctx.childLogger.error("Invalid aws datasource fn. Service name not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
  //     return;
  //   }
  //   if (!method) {
  //     ctx.childLogger.error("Invalid aws datasource fn. Method's name Not found. fn is epxected to be of this format: datasource.<aws_instance_name>.<service_name>.<method_name>");
  //     return;
  //   }

  //   return fnParts;
  // }


}

const SourceType = 'DS';
const Type = 'aws'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'aws'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
'#comment':"please fill required default config properties value to use aws plugin: accessKeyId , region and secretAccessKey.",
 type:'aws',
 default_client_config:{
    region:"", 
    credentials:{
      accessKeyId:"",
      secretAccessKey:""
    }
  },
 services:{
    s3:{
      type:"s3"
    },
    dynamodb:{
      type: "dynamodb"
    },
    sqs:{
      type: "sqs"
    },
    ssm:{
      type: "ssm"
    },
    lamdba:{
      type: "lamdba"
    }
    
  },
  types:{
    dynamodb: "DynamoDB",
    s3: "S3",
    lambda: "Lambda",
    ssm: 'SSM',
    sqs: "SQS"
  }};

export {
  AWSDataSource as DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}

