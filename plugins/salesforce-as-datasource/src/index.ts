import { GSContext, GSDataSource, GSStatus, PlainObject, } from "@godspeedsystems/core";
import * as jsforce from 'jsforce';

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const conn = new jsforce.Connection({
      loginUrl: `${this.config.loginurl}`
    });

    conn.login(this.config.username, this.config.password + this.config.security_token, function (err, userInfo) {
      if (err) { return console.error(err); }
    });
    return conn
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {

    try {
      const {
        params,
        sobject,
        meta: { fnNameInWorkflow },
      } = args;

      const methodName = fnNameInWorkflow.split('.')[2];
      const ds = fnNameInWorkflow.split('.')[1];
      const client = this.client;

      if (client) {
        if (methodName === "query") {
          const response = await client["query"](params['Query']);
          return response;
        }
        else if (typeof client.sobject(sobject)[methodName] === 'function') {
          if (methodName == "delete" || methodName == "retrieve") {
            const response = await client.sobject(sobject)[methodName](params['Id']);
            return response;
          }
          else {
            const response = await client.sobject(sobject)[methodName](params);
            return response;
          }

        } else {
          return `Method '${methodName}' does not exist on the ${ds} Client.`;
        }
      }
    } catch (error) {
      return error;
    }
  }
}
const SourceType = 'DS';
const Type = "salesforce";
const CONFIG_FILE_NAME = "salesforce";
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
