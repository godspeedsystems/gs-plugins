import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { glob } from "glob";
import mongoose, { Aggregate } from "mongoose";
import path from "path";

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

			// Initialize your Mongoose client
			await mongoose.connect(process.env.MONGO_URL!, {
				// Mongoose connection options
			});
			return await this.loadModels();
		} catch (error) {
			throw error;
		}
	}
	private async loadModels(): Promise<PlainObject> {
		//const modelsPath = path.join(__dirname, '..', '..', '..', '..', 'dist', 'datasources', this.config.name, 'models');
		const modelsPath = __dirname.replace('/types', '');
		const modules: string[] =

			await glob(modelsPath + `/${this.config.name}/models/*.{ts,js}`, { ignore: 'node_modules/**' });
		const models: PlainObject = {};
		for (let file of modules) {
			const relativePath = path.relative(__dirname, file).replace(/\.(js)/, '');
			const model = await require(relativePath);
			models[model.type] = model.model;
		}
		return models;

	}
	async execute(ctx: GSContext, args: PlainObject): Promise<any> {
		let {

			meta: { entityType, method, authzPerms }, //Right now authzPerms are not implemented
			...rest
		} = args;
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
			ctx.childLogger.error(`Error in executing Mongoose datasource ${this.config.name}'s fn ${entityType}.${method} with args ${args}. Error message: ${err.message}. Full Error: ${err}`)
			return new GSStatus(false, 500, undefined, { message: "Internal server error" })
		}
	}

	private async command(ctx: GSContext, modelName: string, args: [], method: string): Promise<GSStatus> {
		try {
			const model = (this.client as PlainObject)[modelName];
			const res = await model[method](...args);
			const code = this.successResponseCodes[method] || 200;
			return new GSStatus(true, code, undefined, res);
		} catch (err: any) {
			ctx.childLogger.error(`Error in executing mongoose ${method} command ${err} %o`, err);
			return new GSStatus(false, 500, undefined, { message: err.message, error: err });
		}
	}
}
//These four constants are only for plugin developers. But not needed if you copy paste this code locally.
const SourceType = "DS"; 
const Type = "mongoose"; // this is the default name of the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mongoose"; // This is the default name of the generated yaml file. in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {
	'#comment note':'we have commented additional properties from the config, uncomment required properties to use for your project. also refer documentation to know more about the properties.',
	type:" mongoose",
	'#successResponseCodes': 
	  	{
			'#create': 201,
			'#find': 200,
			'#findOne': 200,
			'#aggregate': 200,
			'#findOneAndUpdate': 201,
			'#findOneAndDelete': 202
		}
	};

export {
	DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG
}