import { GSContext, GSDataSource, GSStatus, logger, PlainObject } from "@godspeedsystems/core";
import OpenAI from "openai";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<PlainObject> {
    // initialize your client
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    if (!this.client) {
      this.client = await this.initClient(); // Ensure client is initialized
    }
    
    const client = this.client as OpenAI;
    const { prompt, meta: { fnNameInWorkflow } } = args;
    
    // Parse method from fnNameInWorkflow
    let method = fnNameInWorkflow?.split(".")[2];

    // Validate that client and method are available
    if (!client) {
      return new GSStatus(false, 500, "ChatGPT client is not initialized");
    }
    if (!method) {
      return new GSStatus(false, 400, "Method name is missing in fnNameInWorkflow");
    }

    // Use destructuring with defaults to get config values
    const { model = "gpt-4", temperature = 1, max_tokens = 500 } = this.config;

    try {
      if (method === "execute") {
        // Execute ChatGPT completion
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens,
        });
        logger.info('model', model);
        logger.info('temperature', temperature);
        logger.info('max_tokens', max_tokens);
        return new GSStatus(true, 200, "Success", response);
      } else {
        return new GSStatus(false, 400, `Invalid method: ${method}`);
      }
    } catch (error) {
      logger.error("Error in ChatGPT execute: ", error);
      return new GSStatus(false, 500, "ChatGPT Error", { error });
    }
  }
}

// Plugin Configuration
const SourceType = 'DS';
const Type = "chatgpt"; // this is the loader file of the plugin, so the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "chatgpt"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
  type: "chatgpt",
  model: "gpt-4",              // Default model
  temperature: 0.7,            // Default temperature (controls randomness)
  max_tokens: 500,             // Max tokens for response length control
};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};
