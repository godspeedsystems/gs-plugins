import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { Pinecone, Index } from "@pinecone-database/pinecone";

export default class DataSource extends GSDataSource {
  private pineconeClient!: Pinecone;

  protected async initClient(): Promise<object> {
    const { apiKey, indexName, dimension = 1536, metric = 'cosine',
            cloud = 'aws', region = 'us-east-1' } = this.config;

    if (!apiKey) {
      throw new Error(
        `[pinecone] apiKey is required. Set it in the datasource YAML config.`
      );
    }

    this.pineconeClient = new Pinecone({ apiKey });

    const existing = await this.pineconeClient.listIndexes();
    const indexExists = existing.indexes?.some((idx: any) => idx.name === indexName) ?? false;

    if (!indexExists) {
      await this.pineconeClient.createIndex({
        name: indexName,
        dimension,
        metric,
        spec: { serverless: { cloud, region } },
        waitUntilReady: true,
      });
    }

    return this.pineconeClient.index(indexName) as object;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<GSStatus> {
    const {
      meta: { fnNameInWorkflow },
      ...rest
    } = args;

    // Resolve method: prefer args.method, fall back to 3rd segment of fnNameInWorkflow
    const method: string = rest.method ?? fnNameInWorkflow?.split('.')[2];

    if (!method) {
      return new GSStatus(false, 400, 'method is required (insert|update|delete|query|deleteIndex)');
    }

    const index = this.client as Index;
    const { indexName } = this.config;
    const namespace: string = rest.namespace ?? this.config.namespace ?? 'default';
    const ns = index.namespace(namespace);

    try {
      switch (method) {
        // ── INSERT ─────────────────────────────────────────────────────────────
        case 'insert': {
          // Accepts a single document object or an array of documents.
          // Each document: { id: string, values: number[], metadata?: object }
          if (!rest.documents) {
            return new GSStatus(false, 400, 'documents is required for insert');
          }
          const docs: Array<{ id: string; values: number[]; metadata?: PlainObject }> =
            Array.isArray(rest.documents) ? rest.documents : [rest.documents];

          await ns.upsert(docs);

          return new GSStatus(true, 200, 'Vectors upserted successfully', {
            ids: docs.map((d) => d.id),
            indexName,
            namespace,
          });
        }

        // ── UPDATE ─────────────────────────────────────────────────────────────
        case 'update': {
          // args.id        — required vector id
          // args.values    — optional new vector values
          // args.metadata  — optional metadata to SET (replaces existing metadata fields)
          const { id, values, metadata } = rest;
          if (!id) {
            return new GSStatus(false, 400, 'id is required for update');
          }
          await ns.update({
            id,
            ...(values !== undefined && { values }),
            ...(metadata !== undefined && { setMetadata: metadata }),
          });
          return new GSStatus(true, 200, 'Vector updated successfully', { id, indexName, namespace });
        }

        // ── DELETE ─────────────────────────────────────────────────────────────
        case 'delete': {
          // args.id     — single id (string)
          // args.ids    — multiple ids (string[])
          // args.filter — metadata filter object (deleteMany by filter)
          const { id, ids, filter } = rest;
          if (id) {
            await ns.deleteOne(id);
            return new GSStatus(true, 200, 'Vector deleted', { id, indexName, namespace });
          } else if (ids) {
            await ns.deleteMany(ids);
            return new GSStatus(true, 200, 'Vectors deleted', { ids, indexName, namespace });
          } else if (filter) {
            await ns.deleteMany({ filter });
            return new GSStatus(true, 200, 'Vectors deleted by filter', { filter, indexName, namespace });
          } else {
            return new GSStatus(false, 400, 'delete requires id, ids, or filter');
          }
        }

        // ── QUERY ──────────────────────────────────────────────────────────────
        case 'query': {
          // args.vector          — query vector (number[])
          // args.topK            — max results (default 10)
          // args.filter          — optional metadata filter
          // args.includeMetadata — include metadata in results (default true)
          // args.includeValues   — include vector values in results (default false)
          const {
            vector,
            topK = 10,
            filter,
            includeMetadata = true,
            includeValues = false,
          } = rest;

          if (!vector) {
            return new GSStatus(false, 400, 'vector is required for query');
          }

          const result = await ns.query({
            topK,
            vector,
            ...(filter && { filter }),
            includeMetadata,
            includeValues,
          });

          return new GSStatus(true, 200, 'Query successful', {
            matches: result.matches?.map((m) => ({
              id: m.id,
              score: m.score,
              metadata: m.metadata,
            })) ?? [],
            namespace,
            indexName,
          });
        }

        // ── DELETE INDEX ───────────────────────────────────────────────────────
        case 'deleteIndex': {
          await this.pineconeClient.deleteIndex(indexName);
          return new GSStatus(true, 200, `Index '${indexName}' deleted`, { indexName });
        }

        default:
          return new GSStatus(false, 400, `Unknown method '${method}'. Valid: insert|update|delete|query|deleteIndex`);
      }
    } catch (error: any) {
      ctx.childLogger?.error(`[pinecone] ${method} failed: ${error?.message ?? error}`);
      return new GSStatus(false, error?.statusCode ?? 500, `Pinecone ${method} error`, { error: error?.message });
    }
  }
}

const SourceType = 'DS';
const Type = 'pinecone';
const CONFIG_FILE_NAME = 'pinecone';
const DEFAULT_CONFIG = {
  type: 'pinecone',
  apiKey: '',
  indexName: 'my-index',
  dimension: 1536,
  metric: 'cosine',
  cloud: 'aws',
  region: 'us-east-1',
  namespace: 'default',
};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
