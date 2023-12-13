import { GSContext, GSDataSource, GSStatus, PlainObject, } from "@godspeedsystems/core";
import oracledb from 'oracledb';

export default class DataSource extends GSDataSource {
    protected async initClient(): Promise<object> {
        const connection = await oracledb.getConnection({
            user: this.config.user,
            password: this.config.password,
            connectString: this.config.connectString,
        });
        return connection
    }

    async execute(ctx: GSContext, args: PlainObject): Promise<any> {
        const {
            meta: { fnNameInWorkflow },
            sql
        } = args;
        let options = args?.options || {} //autoCommit: true 
        const method = fnNameInWorkflow.split(".")[2];
        if (this.client) {
            try {
                switch (method) {
                    case 'execute':
                        const result = await this.client.execute(sql,options);
                        return result;
                    default:
                        return `Unsupported operation: ${method}`;
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
        }
    }
}

const SourceType = 'DS';
const Type = "oracledb"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "oracledb"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
