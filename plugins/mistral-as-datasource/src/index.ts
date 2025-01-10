import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { Mistral } from '@mistralai/mistralai';
import fs from "fs";
import path from "path";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
       // Initialize the OpenAI client with the API key from environment variables
       const apiKey = process.env.MISTRAL_API_KEY;
       const client = new Mistral({apiKey: apiKey});
       return client;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const client = this.client as Mistral;
    const { meta: { fnNameInWorkflow, method } } = args;
    
    // Get the method name
    let workflow = method || fnNameInWorkflow?.split(".")[2];

    // Validate client and method
    if (!client) {
      return new GSStatus(false, 500, "MistralAI client is not initialized");
    }
    if (!workflow) {
      return new GSStatus(false, 400, "Method name is missing in fnNameInWorkflow");
    }

    // Load global and method-specific configurations from YAML
    const methodConfig = this.config.methods?.[workflow] || {};

    try {
      switch (workflow) {
        case "generatetext": {
          const { prompt } = args;
          const model = methodConfig.model || "mistral-large-latest";
          
          const chatResponse = await client.chat.complete({
            model: model,
            messages: [{role: 'user', content: prompt}],
          });
          
          const responseContent = chatResponse.choices[0].message.content ?? "No response text generated";
          return new GSStatus(true, 200, "Success", responseContent);
        }
        
        case "generatecode": {
          const { prompt } = args;
          const model = methodConfig.model || "codestral-mamba-latest";
          const instruction = methodConfig.instruction || "You are a coding assistant designed to output directly executable code. Do not include any greetings, explanations, or contextual text outside of the code. Your outputs must be limited to the code block itself. The code must be extensively and meticulously commented to explain every detail of its functionality, logic, and purpose, ensuring clarity even for readers with minimal coding experience. Each line or block of code must be followed by an explanation in the comments. Maintain proper formatting and do not include any unrelated text or output.";
          
          const chatResponse = await client.chat.complete({
            model: model,
            messages: [{role: 'system', content: instruction}, {role: 'user', content: prompt}],
          });
          
          const responseContent = chatResponse.choices[0].message.content ?? "No response code generated";
          return new GSStatus(true, 200, "Success", responseContent);
        }
        
        case "generatetextfromimage": {
          
          const { prompt } = args;
          const { imgurl } = args;

          const model = methodConfig.model || "pixtral-12b";

          const chatResponse = await client.chat.complete({
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt},
                  {
                    type: "image_url",
                    imageUrl: imgurl,
                  },
                ],
              },
            ],
          });
          
          const responseContent = chatResponse.choices[0].message.content ?? "No response code generated";
          return new GSStatus(true, 200, "Success", responseContent);
          
        }
        
        case "generatejson": {
          
          const { prompt } = args;
          const model = methodConfig.model || "mistral-large-latest";
          
          const chatResponse = await client.chat.complete({
            model: model,
            messages: [{role: 'user', content: prompt}],
            responseFormat: {type: 'json_object'},
          });
          
          const responseContent = chatResponse.choices[0].message.content ?? "No response text generated";
          return new GSStatus(true, 200, "Success", responseContent);
          
        }
        
        case "moderate": {
          
          const { prompt } = args;
          const model = methodConfig.model || "mistral-moderation-latest";
          
          const response = await client.classifiers.moderate({
            model: model,
            inputs: [prompt],
        });
        
          const categoryScores = response.results;
        
          return new GSStatus(true, 200, "Success", categoryScores);
          
        }
        
        
        

        default: {
          return new GSStatus(false, 400, `Invalid method: ${method}`);
        }
      }
    } catch (error) {
     throw error; 
    }
  }
}

const SourceType = 'DS';
const Type = "mistral";  // Loader type for the plugin
const CONFIG_FILE_NAME = "mistral";  // Configuration file name for the datasource
const DEFAULT_CONFIG = {
  
};


export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
};