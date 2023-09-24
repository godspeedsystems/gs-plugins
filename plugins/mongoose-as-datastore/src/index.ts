import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from '@godspeedsystems/core';
import mongoose from 'mongoose';

type ResponseCodes = {
  [key: string]: number;
};

type MongooseOperations =
  | 'create'
  | 'find'
  | 'findById'
  | 'findOne'
  | 'findByIdAndUpdate'
  | 'findOneAndUpdate'
  | 'updateOne'
  | 'updateMany'
  | 'findByIdAndDelete'
  | 'findOneAndDelete'
  | 'deleteMany'
  | 'deleteOne';

function responseCode(method: string): number {
  return response_codes[method] || 200;
}

const response_codes: ResponseCodes = {
  create: 201,
  find: 200,
  findById: 200,
  findOne: 200,
  findByIdAndUpdate: 204,
  findOneAndUpdate: 204,
  updateOne: 204,
  updateMany: 204,
  findByIdAndDelete: 202,
  findOneAndDelete: 202,
  deleteMany: 202,
  deleteOne: 202,
};

const mongooseOperations: MongooseOperations[] = [
  'create',
  'find',
  'findById',
  'findOne',
  'findByIdAndUpdate',
  'findOneAndUpdate',
  'updateOne',
  'updateMany',
  'findByIdAndDelete',
  'findOneAndDelete',
  'deleteMany',
  'deleteOne',
];

// and mongoose operations are string types

class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const { db_url, options } = this.config;
    try {
      /**
       * Connects to a MongoDB database using Mongoose.
       * @param db_url - The URL of the MongoDB database.
       * @param options - The options to use when connecting to the database.
       * @returns A Promise that resolves to the Mongoose client object.
       */
      const client = await mongoose.connect(db_url, options);
      return client;
    } catch (error) {
      throw error;
    }
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;

    const {
      meta: { entityType, method, fnNameInWorkflow },
      ...rest
    } = args as {
      meta: {
        entityType: string;
        method: string & MongooseOperations;
        fnNameInWorkflow: string;
      };
    };

    try {
      if (this.client) {
        const client = this.client;

        if (entityType && !client.models[entityType]) {
          return Promise.reject(
            new GSStatus(
              false,
              400,
              undefined,
              `Invalid entityType '${entityType}' in ${fnNameInWorkflow}.`,
            ),
          );
        }

        /* `const model = client.models[entityType];` is retrieving the Mongoose model associated with
       the given `entityType`. */
        const model = client.models[entityType];

        if (!mongooseOperations.includes(method)) {
          return Promise.reject(
            new GSStatus(
              false,
              500,
              undefined,
              `Invalid method '${method}' in ${fnNameInWorkflow}.`,
            ),
          );
        }

        const mongooseResponse = await model[method](rest);

        return Promise.resolve(
          new GSStatus(true, responseCode(method), undefined, mongooseResponse),
        );
      }
    } catch (error: any) {
      logger.error(error);
      return Promise.reject(
        new GSStatus(false, 400, error.message, JSON.stringify(error.message)),
      );
    }
  }
}

const SourceType = 'DS';
const Type = 'mongoose';
const CONFIG_FILE_NAME = 'mongoose';
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
