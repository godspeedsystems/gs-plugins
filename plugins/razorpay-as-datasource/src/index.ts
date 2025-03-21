import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import Razorpay from 'razorpay';

export default class RazorpayDataSource extends GSDataSource {
  async initClient(): Promise<PlainObject> {
    const { key_id, key_secret } = this.config;
    return new Razorpay({
      key_id,
      key_secret,
    });
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    const { client } = this;
    const { method, entity, ...rest } = args;

    if (!client) {
      return new GSStatus(false, 500, 'Client not initialized');
    }

    try {
      const razorpayMethod = client[entity]?.[method];
      if (typeof razorpayMethod !== 'function') {
        throw new Error(`Invalid method: ${method} for entity: ${entity}`);
      }

      const result = await razorpayMethod.call(client[entity], rest);
      return new GSStatus(true, 200, undefined, result);
    } catch (error: any) {
      ctx.logger.error('Error executing Razorpay request:', error);
      return new GSStatus(false, 500, error.message, error);
    }
  }
}

const SourceType = 'DS';
const Type = 'razorpay';
const CONFIG_FILE_NAME = 'razorpay';
const DEFAULT_CONFIG = {};

export {
  RazorpayDataSource as DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
};
