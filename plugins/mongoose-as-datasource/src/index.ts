import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { glob } from "glob";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export default class DataSource extends GSDataSource {
    private successResponseCodes: PlainObject = {
        create: 201,
        find: 200,
        findOne: 200,
        aggregate: 200
    }
    protected async initClient(): Promise<PlainObject> {
        this.successResponseCodes = this.config.successResponseCodes || this.successResponseCodes;
        try {
            console.log(`[DEBUG] Connecting to MongoDB with URL: ${process.env.MONGO_URL ? "URL defined" : "URL NOT DEFINED!"}`);
            console.log(`[DEBUG] Datasource name: ${this.config.name}`);
            
            // Initialize your Mongoose client
            await mongoose.connect(process.env.MONGO_URL!, {
                // Mongoose connection options
            });
            
            console.log("[DEBUG] MongoDB connection successful");
            return await this.loadModels();
        } catch (error) {
            console.error("[DEBUG] MongoDB connection error:", error);
            throw error;
        }
    }
    
    private async loadModels(): Promise<PlainObject> {
        // Fix path handling for Windows compatibility
        const modelsPath = path.resolve(__dirname.replace(/[\/\\]types$/, ''), this.config.name, 'models');
        console.log(`[DEBUG] Models path: ${modelsPath}`);
        
        // Check if directory exists
        if (!fs.existsSync(modelsPath)) {
            console.error(`[DEBUG] Models directory doesn't exist: ${modelsPath}`);
            
            // Try to list parent directory to help with debugging
            const parentDir = path.dirname(modelsPath);
            console.log(`[DEBUG] Parent directory (${parentDir}) contents:`, 
                fs.existsSync(parentDir) ? fs.readdirSync(parentDir) : 'Parent directory not found');
            
            // Create a fallback empty object if no models are found
            return {};
        }
        // Use normalized path pattern for glob
        const modelPattern = path.join(modelsPath, '*.{ts,js}').replace(/\\/g, '/');
                
        // Use glob with normalized pattern and explicit options
        const modules: string[] = await glob(modelPattern, { 
            ignore: 'node_modules/**',
            windowsPathsNoEscape: true // Important for Windows paths
        });
        
        console.log(`[DEBUG] Found ${modules.length} model files: ${JSON.stringify(modules)}`);
        
        const models: PlainObject = {};
        
        // If no modules found via glob, try direct file reading
        if (modules.length === 0) {
            console.log(`[DEBUG] No models found with glob, trying direct file reading`);
            try {
                const files = fs.readdirSync(modelsPath);
                for (const file of files) {
                    if (file.endsWith('.js') || file.endsWith('.ts')) {
                        try {
                            const filePath = path.join(modelsPath, file);
                            console.log(`[DEBUG] Loading model from: ${filePath}`);
                            // Use require with absolute path
                            const model = require(filePath);
                            if (model && model.type && model.model) {
                                console.log(`[DEBUG] Model loaded with type: ${model.type}`);
                                models[model.type] = model.model;
                            } else {
                                console.error(`[DEBUG] Invalid model format in file ${file}`);
                            }
                        } catch (err) {
                            console.error(`[DEBUG] Error loading model from file ${file}:`, err);
                        }
                    }
                }
            } catch (err) {
                console.error(`[DEBUG] Error reading models directory:`, err);
            }
        } else {
            // Process modules found by glob
            for (let file of modules) {
                try {
                    console.log(`[DEBUG] Loading model from: ${file}`);
                    // Use require with absolute path
                    const model = require(file);
                    if (model && model.type && model.model) {
                        console.log(`[DEBUG] Model loaded with type: ${model.type}`);
                        models[model.type] = model.model;
                    } else {
                        console.error(`[DEBUG] Invalid model format in file ${file}`);
                    }
                } catch (err) {
                    console.error(`[DEBUG] Error loading model from file ${file}:`, err);
                }
            }
        }
        
        console.log(`[DEBUG] Loaded models: ${Object.keys(models).join(', ')}`);
        return models;
    }
    
    async execute(ctx: GSContext, args: PlainObject): Promise<any> {
        console.log(`[DEBUG] Execute called with args:`, JSON.stringify(args));
        
        if (!args.meta) {
            console.error("[DEBUG] Error: args.meta is undefined");
            return new GSStatus(false, 500, undefined, { message: "Meta information missing" });
        }
        
        let {
            meta: { entityType, method, authzPerms }, //Right now authzPerms are not implemented
            ...rest
        } = args;
        
        console.log(`[DEBUG] Entity type: ${entityType}, Method: ${method}`);
        
        delete args.meta;
        if (Array.isArray(args)) {
            rest = args;
        } else {
            rest = [args];
        }
        
        try {
            //@ts-ignore
            return await this.command(ctx, entityType, rest, method);
			
        } catch (err: any) {
            console.error(`[DEBUG] Error in execute:`, err);
            ctx.childLogger.error(`Error in executing Mongoose datasource ${this.config.name}'s fn ${entityType}.${method} with args ${args}. Error message: ${err.message}. Full Error: ${err}`)
            return new GSStatus(false, 500, undefined, { message: "Internal server error" })
        }
    }
    
    private async command(ctx: GSContext, modelName: string, args: [], method: string): Promise<GSStatus> {
        try {
            console.log(`[DEBUG] Command - Model name: ${modelName}, Method: ${method}`);
            console.log(`[DEBUG] Available models:`, Object.keys(this.client || {}).join(', '));
            
            const model = (this.client as PlainObject)[modelName];
            
            if (!model) {
                console.error(`[DEBUG] Error: Model '${modelName}' not found in client`);
                return new GSStatus(false, 404, undefined, { message: `Model '${modelName}' not found` });
            }
            
            if (!model[method]) {
                console.error(`[DEBUG] Error: Method '${method}' not found on model '${modelName}'`);
                return new GSStatus(false, 404, undefined, { message: `Method '${method}' not found on model '${modelName}'` });
            }
            
            console.log(`[DEBUG] Executing ${modelName}.${method} with args:`, JSON.stringify(args));
            const res = await model[method](...args);
            const code = this.successResponseCodes[method] || 200;
            return new GSStatus(true, code, undefined, res);
        } catch (err: any) {
            console.error(`[DEBUG] Error in command:`, err);
            ctx.childLogger.error(`Error in executing mongoose ${method} command ${err} %o`, err);
            return new GSStatus(false, 500, undefined, { message: err.message, error: err });
        }
    }
}
const SourceType = "DS"; 
const Type = "mongoose"; // this is the default name of the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mongoose"; // This is the default name of the generated yaml file. in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
	type:" mongoose",
	successResponseCodes: 
	  	{
			create: 201,
			find: 200,
			findOne: 200,
			aggregate: 200,
			findOneAndUpdate: 201,
			findOneAndDelete: 202
		}
	};

export {
	DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG
}