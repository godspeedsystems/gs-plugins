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
    
    // private async loadModels(): Promise<PlainObject> {
    //     const modelsPath = path.join(__dirname, '..', 'dist', 'models');
    //     console.log(`[DEBUG] Models path: ${modelsPath}`);
    //     // Check if directory exists
    //     try {
    //         if (!fs.existsSync(modelsPath)) {
    //             console.error(`[ERROR] Models directory not found: ${modelsPath}`);
    //             return {};
    //         }
    //         console.log(`[DEBUG] Models directory found: ${modelsPath}`);
    //     } catch (dirCheckError) {
    //         console.error(`[ERROR] Error checking models directory: ${dirCheckError}`);
    //         return {};
    //     }
    //     // Find model files
    //     const modules: string[] = glob.sync(path.join(modelsPath, '*.{ts,js}'), { ignore: 'node_modules/**' });
        
    //     // Log number of model files found
    //     if (modules.length === 0) {
    //         console.warn(`[WARN] No model files found in: ${modelsPath}`);
    //         return {};
    //     }
    //     console.log(`[DEBUG] Found ${modules.length} model file(s)`);

    //     const models: PlainObject = {}; 
    //     for (let file of modules) {
    //         try {
    //             const relativePath = path.relative(__dirname, file).replace(/\.(js)/, '');
    //             console.log(`[DEBUG] Loading model from: ${relativePath}`);
                
    //             const model = await require(relativePath);
                
    //             if (!model.type || !model.model) {
    //                 console.warn(`[WARN] Invalid model structure in file: ${file}`);
    //                 continue;
    //             }
    //             models[model.type] = model.model;
    //             console.log(`[DEBUG] Loaded model type: ${model.type}`);
    //         } catch (modelLoadError) {
    //             console.error(`[ERROR] Failed to load model from ${file}: ${modelLoadError}`);
    //         }
    //     }
    //     console.log(`[DEBUG] Total models loaded: ${Object.keys(models).length}`);
    //     return models;
    // }
    private async loadModels(): Promise<PlainObject> {
    // Specific path for user's project models
    const modelsPath = path.join(process.cwd(), 'dist', 'datasources', 'mongoose', 'models');
    
    console.log(`[DEBUG] Attempting to load models from: ${modelsPath}`);

    // Check if directory exists
    try {
        if (!fs.existsSync(modelsPath)) {
            console.error(`[ERROR] Models directory not found: ${modelsPath}`);
            console.log(`[DEBUG] Current working directory: ${process.cwd()}`);
            
            // Log directory structure for debugging
            try {
                const basePath = path.join(process.cwd(), 'dist', 'datasources');
                if (fs.existsSync(basePath)) {
                    console.log('[DEBUG] Contents of datasources directory:');
                    fs.readdirSync(basePath).forEach(dir => {
                        console.log(`[DEBUG] - ${dir}`);
                    });
                } else {
                    console.log(`[DEBUG] Datasources base path does not exist: ${basePath}`);
                }
            } catch (structureCheckError) {
                console.error('[ERROR] Error checking directory structure:', structureCheckError);
            }
            
            return {};
        }
        console.log(`[DEBUG] Models directory found: ${modelsPath}`);
    } catch (dirCheckError) {
        console.error(`[ERROR] Error checking models directory: ${dirCheckError}`);
        return {};
    }
    // Find model files
   // const modules: string[] =glob.sync(path.join(modelsPath, '*.{ts,js}'), { ignore: 'node_modules/**' })
    const modelPattern = path.join(modelsPath, '*.{ts,js}').replace(/\\/g, '/');
        // Use glob with normalized pattern and explicit options
        const modules: string[] = await glob(modelPattern, { 
            ignore: 'node_modules/**',
            windowsPathsNoEscape: true // Important for Windows paths
        });
   
    console.log(`[DEBUG] Found ${modules.length} model file(s)`);

    const models: PlainObject = {}; 
    
    for (let file of modules) {
        try {
            const tsEquivalent = file.replace('.js', '.ts');
            if (file.endsWith('.js') && modules.includes(tsEquivalent)) {
                console.log(`[DEBUG] Skipping .js file as .ts equivalent exists: ${file}`);
                continue;
            }
            console.log(`[DEBUG] Attempting to load model from: ${file}`);
            // Use dynamic import for better ES module support
            const modelModule = await import(file);
            // Check for default export or direct export
            const model = modelModule.default || modelModule;
            
            if (!model.type || !model.model) {
                console.warn(`[WARN] Invalid model structure in file: ${file}`);
                continue;
            }
            models[model.type] = model.model;
            console.log(`[DEBUG] Loaded model type: ${model.type}`);
        } catch (modelLoadError) {
            console.error(`[ERROR] Failed to load model from ${file}:`, modelLoadError);
        }
    }
    console.log(`[DEBUG] Total models loaded: ${Object.keys(models).length}`);   
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
	type: mongoose,
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
