import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, GSDataSource, GSContext } from "godspeed-node";

class PrismaDataSource extends GSDataSource {
  async initClient(): Promise<PlainObject> {

    return {};
  }

  execute(ctx: GSContext, args: PlainObject): Promise<any> {
    throw new Error("Method not implemented.");
  }
}


export {
  PrismaDataSource,
}