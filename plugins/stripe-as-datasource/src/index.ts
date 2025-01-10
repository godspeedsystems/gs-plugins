import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import Stripe from "stripe";

export default class StripeDataSource extends GSDataSource {
  private stripeClient: Stripe | undefined;

  // protected async initClient(): Promise<PlainObject> {
  //   const { apiKey } = this.config;
  //   if (!apiKey) {
  //     throw new Error("Stripe API key is missing in the configuration.");
  //   }

  //   this.stripeClient = new Stripe(apiKey, { apiVersion: "2022-11-15" });
  //   return { stripeClient: this.stripeClient };
  // }
  protected async initClient(): Promise<PlainObject> {
    const { apiKey } = this.config;
    if (!apiKey) {
      throw new Error("Stripe API key is missing in the configuration.");
    }
    this.stripeClient = new Stripe(apiKey);
    return { stripeClient: this.stripeClient };
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    const { meta: { method, resource }, ...rest } = args;

    if (!this.stripeClient) {
      ctx.childLogger.error("Stripe client is not initialized.");
      return new GSStatus(false, 500, undefined, { message: "Internal server error" });
    }

    try {
      const response = await (this.stripeClient as any)[resource][method](...rest.args || []);
      return new GSStatus(true, 200, undefined, response);
    } catch (error: any) {
      ctx.childLogger.error(`Error calling Stripe API: ${error.message}`, error);
      return new GSStatus(false, error.statusCode || 500, undefined, { message: error.message });
    }
  }
}

const SourceType = "DS";
const Type = "stripe";
const CONFIG_FILE_NAME = "stripe";
const DEFAULT_CONFIG = {
  apiKey: "<%config.STRIPE_API_KEY%>"
};

export {
  StripeDataSource as DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};
