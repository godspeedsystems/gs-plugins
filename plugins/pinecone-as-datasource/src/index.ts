import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from "@godspeedsystems/core";
import { Pinecone } from "@pinecone-database/pinecone";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    const { api_key, index_name } = this.config;

    if (!api_key) {
      throw new Error("Pinecone API key is required");
    }

    if (!index_name) {
      throw new Error("Pinecone index name is required");
    }

    const client = new Pinecone({
      apiKey: api_key,
    });

    return client;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const { meta, ...restArgs } = args;
      const { fnNameInWorkflow } = meta;

      if (!fnNameInWorkflow) {
        return new GSStatus(false, 400, "fnNameInWorkflow is required");
      }

      const parts = fnNameInWorkflow.split(".");
      const operation = parts[parts.length - 1];

      switch (operation) {
        case "insert":
          return await this._insert(ctx, restArgs);
        case "query":
          return await this._query(ctx, restArgs);
        case "update":
          return await this._update(ctx, restArgs);
        case "delete":
          return await this._delete(ctx, restArgs);
        case "deleteIndex":
          return await this._deleteIndex(ctx, restArgs);
        default:
          return new GSStatus(
            false,
            400,
            `Unknown operation: ${operation}`
          );
      }
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }

  private async _insert(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    try {
      const { index_name } = this.config;
      const { vectors } = args;

      if (!vectors || !Array.isArray(vectors)) {
        return new GSStatus(false, 400, "vectors array is required");
      }

      const client = this.client as Pinecone;
      const index = client.index(index_name);

      const result = await index.upsert(vectors);

      return new GSStatus(true, 200, "Vectors inserted successfully", result);
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }

  private async _query(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    try {
      const { index_name } = this.config;
      const { vector, top_k = 10, filter, includeMetadata = true } = args;

      if (!vector || !Array.isArray(vector)) {
        return new GSStatus(false, 400, "vector array is required");
      }

      const client = this.client as Pinecone;
      const index = client.index(index_name);

      const result = await index.query({
        vector,
        topK: top_k,
        filter,
        includeMetadata,
      });

      return new GSStatus(true, 200, "Query executed successfully", result);
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }

  private async _update(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    try {
      const { index_name } = this.config;
      const { id, values, metadata, sparseValues } = args;

      if (!id) {
        return new GSStatus(false, 400, "id is required");
      }

      const client = this.client as Pinecone;
      const index = client.index(index_name);

      const result = await index.update({
        id,
        values,
        metadata,
        sparseValues,
      });

      return new GSStatus(true, 200, "Vector updated successfully", result);
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }

  private async _delete(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    try {
      const { index_name } = this.config;
      const { ids, deleteAll = false, filter } = args;

      const client = this.client as Pinecone;
      const index = client.index(index_name);

      let result;

      if (deleteAll) {
        result = await index.deleteAll();
      } else if (filter) {
        result = await index.deleteMany({ filter });
      } else if (ids && Array.isArray(ids)) {
        result = await index.deleteMany({ ids });
      } else {
        return new GSStatus(
          false,
          400,
          "ids, deleteAll, or filter is required"
        );
      }

      return new GSStatus(true, 200, "Vectors deleted successfully", result);
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }

  private async _deleteIndex(
    ctx: GSContext,
    args: PlainObject
  ): Promise<GSStatus> {
    try {
      const { index_name } = this.config;

      const client = this.client as Pinecone;
      const result = await client.deleteIndex(index_name);

      return new GSStatus(
        true,
        200,
        "Index deleted successfully",
        result
      );
    } catch (error: any) {
      return new GSStatus(false, 500, error.message, error);
    }
  }
}

const SourceType = "DS";
const Type = "pinecone";
const CONFIG_FILE_NAME = "pinecone";
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
};
