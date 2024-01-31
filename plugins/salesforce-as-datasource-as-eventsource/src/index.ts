import {
  GSContext,
  GSDataSource,
  PlainObject,
  GSDataSourceAsEventSource,
  GSCloudEvent,
  GSStatus,
  GSActor,
} from "@godspeedsystems/core";
import jsforce from "jsforce";

class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const {
      oauth2,
      username,
      password,
      securityToken,
      serverUrl,
      sessionId,
      loginUrl,
      accessToken,
      refreshToken,
      instanceUrl,
    } = this.config;

    try {
      // Initialize the Salesforce client with your authentication details
      if (serverUrl && sessionId) {
        const conn = new jsforce.Connection({
          serverUrl: serverUrl,
          sessionId: sessionId,
        });
      } else if (accessToken && instanceUrl) {
        const conn = new jsforce.Connection({
          accessToken: accessToken,
          instanceUrl: instanceUrl,
        });
      } else if (oauth2) {
        const conn = new jsforce.Connection({
          oauth2: oauth2,
          accessToken: accessToken,
          instanceUrl: instanceUrl,
          refreshToken: refreshToken,
        });
      }
      const conn = new jsforce.Connection({
        loginUrl: loginUrl,
      });
      await conn.login(
        username,
        password + securityToken,
        function (err, userInfo) {
          if (err) {
            console.error(err);
            process.exit(1);

          }
          // console.log(conn.accessToken);
          // console.log(conn.instanceUrl);
          // logged in user property
          // console.log(conn);
          // console.log(userInfo);
          // console.log('Org ID: ' + userInfo.organizationId);
        }
      );

      return conn;
    } catch (error) {
      throw error;
    }
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    try {
      const {
        meta: { fnNameInWorkflow },
        query,
        allOrNone,
        allowRecursive,
        start_date,
        end_date,
        type,
        ...rest
      } = args as {
        meta: { entityType: string; method: string; fnNameInWorkflow: string };
        query: string;
        allOrNone: boolean;
        allowRecursive: boolean;
        start_date: string;
        type: string;
        end_date: string;
      };
      let functionArray = fnNameInWorkflow.split(".");
      const result = Object.values(rest);
      //TODO remove the statement
      if (this.client) {
        if (functionArray.length == 3) {
          const method = functionArray[2];
          let sfresponse = await this.client[method](
            result,
            function (err: any, ret: any) {
              if (err) {
                return console.error(err);
              } else {
                return ret;
              }
            }
          );
          return new GSStatus(true, 200, undefined, sfresponse)

        }
        if (functionArray.length == 4) {
          const method = functionArray[3];
          const api = functionArray[2];

          if (api === "metadata" && method !== "list") {
            let sfresponse = await this.client[api][method](
              type,
              result,
              function (err: any, ret: any) {
                if (err) {
                  //TODO, take from ctx
                  logger.error(err);
                }
              }
            );
            return new GSStatus(true, 200, undefined, sfresponse)

          }
          //TODO reuse common code with try/catch
          let sfresponse = await this.client[api][method](
            result,
            function (err: any, ret: any) {
              if (err) {
                return new GSStatus(true, 500, undefined, sfresponse);
                //
                // return console.error(err);
              } else {
                return ret;
              }
            }
          );
          return new GSStatus(true, 200, undefined, sfresponse);
        }
        if (functionArray.length === 5) {
          const method = functionArray[4];
          const entityType = functionArray[3];
          const api = functionArray[2];
          if (api === "apex") {
            let sfresponse = await this.client.apex[entityType](
              method,
              result,
              function (err: any, ret: any) {
                if (err || !ret.success) {
                  return err;
                } else {
                  return ret;
                }
              }
            );
            return new GSStatus(true, 201, undefined, sfresponse);
          }
          //Add comments
          let sfresponse = await this.client[api](entityType)[method](
            result,
            start_date,
            end_date,
            allOrNone,
            allowRecursive,
            function (err: any, ret: any) {
              if (err || !ret.success) {
                return err;
              } else {
                return ret;
              }
            }
          );
          //TODO remove Promise.resolve from everywhere
          return new GSStatus(true, 201, undefined, sfresponse);
        }
        if (functionArray.length === 6) {
          const method2 = functionArray[5];
          const method1Data = functionArray[4];
          const method1 = functionArray[3];
          const api = functionArray[2];

          if (api === "bulk") {
            let sfresponse = await this.client[api][method1](
              method1Data,
              method2,
              result,
              function (err: any, ret: any) {
                if (err || !ret.success) {
                  return err;
                } else {
                  return ret;
                }
              }
            );
            return new GSStatus(true, 201, undefined, sfresponse);
          }
          let sfresponse = await this.client[api][method1](method1Data)[
            method2
          ](result, function (err: any, ret: any) {
            if (err || !ret.success) {
              return err;
            } else {
              return ret;
            }
          });
          return new GSStatus(true, 201, undefined, sfresponse);
        }
      }
    } catch (error: any) {
      logger.error(error);
      return new GSStatus(false, 500, error.message, { error });
    }
  }
}

class EventSource extends GSDataSourceAsEventSource {
  async subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (
      event: GSCloudEvent,
      eventConfig: PlainObject
    ) => Promise<GSStatus>
  ): Promise<void> {
    const client = this.client;
    const ds = eventKey.split(".")[0];
    const topicName = eventKey.split(".")[1];
    interface mesresp {
      topic: string;
      partition: number;
      message: any;
    }

    if (client) {
      const consumer = client.streaming.topic(topicName);

      await consumer.subscribe({
        eachMessage: async (messagePayload: mesresp) => {
          const { message } = messagePayload;
          let data;
          let msgValue;
          try {
            msgValue = message?.value?.toString();
            data = {
              body: msgValue,
            };
          } catch (ex) {

            //TODO logger the error
            return new GSStatus(
              false,
              500,
              `Error in parsing salesforce event data ${msgValue}`,
              ex
            );
          }
          const event = new GSCloudEvent(
            "id",
            `${ds}.${topicName}`,
            new Date(message.timestamp),
            "salesforce",
            "1.0",
            data,
            "messagebus",
            new GSActor("user"),
            ""
          );
          return await processEvent(event, eventConfig);

        },
      });
    }
  }
}
//TODO try/catch around process event
const SourceType = "BOTH";
const Type = "salesforce"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "salesforce"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
};
