# ISSUE #226 — Feat: Pinecone as a DataSource
**Status:** Planning  
**Package:** `@godspeedsystems/plugins-pinecone-as-datasource`  
**Plugin directory:** `plugins/pinecone-as-datasource/`

---

## Summary

Add a new official Godspeed DataSource plugin that integrates **Pinecone** (serverless vector database) into the declarative `GSDataSource` lifecycle. The plugin lets developers configure Pinecone entirely via a YAML datasource file and use five vector operations — `insert`, `update`, `delete`, `query`, `deleteIndex` — directly in Godspeed workflows without writing any custom integration code.

The plugin follows the identical structure used by every other datasource plugin in this monorepo (`GSDataSource` base class, `initClient()` / `execute()` pattern, same `package.json` / `tsconfig.json` / exports shape). It is **additive only**: no existing plugin or `@godspeedsystems/core` file is touched beyond adding a single row to the root plugin table.

---

## Files to Create

| Path | Purpose |
|------|---------|
| `plugins/pinecone-as-datasource/src/index.ts` | Full plugin implementation (only file with business logic) |
| `plugins/pinecone-as-datasource/package.json` | npm metadata, dependencies, build scripts |
| `plugins/pinecone-as-datasource/tsconfig.json` | TypeScript config (identical to every other plugin) |
| `plugins/pinecone-as-datasource/README.md` | Installation, full YAML config reference, per-method workflow examples |
| `plugins/pinecone-as-datasource/.gitignore` | Ignore `node_modules` and `dist` |
| `plugins/pinecone-as-datasource/.npmignore` | Ignore `node_modules`, `src`, and test files from npm bundle |
| `plugins/pinecone-as-datasource/tests/datasource.test.ts` | Jest test suite (unit + integration) |

## Files to Modify

| Path | Change |
|------|--------|
| `README.md` | Append one row to the plugin table (after row 11, Apollo GraphQL) |

---

## Implementation Steps

### Step 1 — Scaffold directory structure

Create the directory tree `plugins/pinecone-as-datasource/` with `src/` and `tests/` sub-directories. No content yet — just establish the layout.

---

### Step 2 — Write `package.json`

```json
{
  "name": "@godspeedsystems/plugins-pinecone-as-datasource",
  "version": "1.0.0",
  "description": "Pinecone vector database as a datasource plugin for Godspeed Framework",
  "publishConfig": { "access": "public" },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "test": "jest --runInBand"
  },
  "author": { "name": "Godspeed Systems", "email": "admin@godspeed.systems" },
  "keywords": ["pinecone", "vector", "rag", "godspeed", "datasource"],
  "license": "Godspeed License 1.0",
  "devDependencies": {
    "typescript": "^4.9.5",
    "@types/jest": "^29.5.12",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.4"
  },
  "dependencies": {
    "@godspeedsystems/core": "^2.4.8",
    "@pinecone-database/pinecone": "^3.0.0",
    "pino-pretty": "^10.2.0"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.ts"],
    "globals": {
      "ts-jest": { "tsconfig": "tsconfig.json" }
    }
  }
}
```

**Key notes:**
- `"types": "dist/index.d.ts"` — correct extension (`.d.ts` not `.d.js` as in chatgpt plugin typo).
- `@pinecone-database/pinecone` is the official Pinecone SDK package (v3+, serverless-compatible).
- `pino-pretty` is included as a peer logging dep consistent with all other plugins.
- `jest` + `ts-jest` are **devDependencies** only.

---

### Step 3 — Write `tsconfig.json`

Identical to every other plugin in this repo:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "esModuleInterop": true
  },
  "exclude": ["./node_modules", "./dist", "./tests"]
}
```

Add `"./tests"` to `exclude` so test files are not compiled into `dist/`.

---

### Step 4 — Write `.gitignore`

```
node_modules
dist
```

---

### Step 5 — Write `.npmignore`

```
node_modules
src
tests
*.test.ts
*.spec.ts
tsconfig.json
```

---

### Step 6 — Write `src/index.ts`

This is the only file with application logic. Full design follows:

#### 6a. Imports

```typescript
import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { Pinecone, Index } from "@pinecone-database/pinecone";
```

#### 6b. Class declaration with private property for raw Pinecone client

```typescript
export default class DataSource extends GSDataSource {
  private pineconeClient!: Pinecone;   // held separately for deleteIndex
```

`this.client` (from `GSDataSource`) will hold the `Index` handle returned by `initClient()`.  
`this.pineconeClient` holds the root `Pinecone` instance needed for `deleteIndex` and `createIndex`.

#### 6c. `initClient()` — full logic

```typescript
protected async initClient(): Promise<object> {
  const { apiKey, indexName, dimension = 1536, metric = 'cosine',
          cloud = 'aws', region = 'us-east-1' } = this.config;

  // 1. Fail fast on missing apiKey
  if (!apiKey) {
    throw new Error(
      `[pinecone] apiKey is required. Set it in your datasource YAML or via PINECONE_API_KEY env var.`
    );
  }

  // 2. Create root Pinecone client
  this.pineconeClient = new Pinecone({ apiKey });

  // 3. Check whether the index exists; create if absent
  const existing = await this.pineconeClient.listIndexes();
  const indexExists = existing.indexes?.some((idx) => idx.name === indexName) ?? false;

  if (!indexExists) {
    ctx.childLogger?.info(`[pinecone] Creating index '${indexName}' (${dimension}d, ${metric})`);
    await this.pineconeClient.createIndex({
      name: indexName,
      dimension,
      metric,
      spec: { serverless: { cloud, region } },
      waitUntilReady: true,
    });
  } else {
    ctx.childLogger?.info(`[pinecone] Reusing existing index '${indexName}'`);
  }

  // 4. Return the typed index handle as this.client
  return this.pineconeClient.index(indexName);
}
```

> **Note:** `initClient()` does not have access to `ctx` — that is a parameter only on `execute()`. The logging lines above use optional chaining defensively. For the actual implementation, use `console.info` / `console.error` (or the module-level `logger` from core) instead of `ctx.childLogger` inside `initClient()`.

Corrected initClient without ctx:
```typescript
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
```

#### 6d. `execute()` — method routing and five operations

```typescript
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
    ctx.childLogger.error(`[pinecone] ${method} failed: ${error?.message ?? error}`);
    return new GSStatus(false, error?.statusCode ?? 500, `Pinecone ${method} error`, { error: error?.message });
  }
}
```

#### 6e. Module-level exports

```typescript
const SourceType = 'DS';
const Type = 'pinecone';           // loader file: types/pinecone.js
const CONFIG_FILE_NAME = 'pinecone'; // datasource YAML: src/datasources/pinecone.yaml
const DEFAULT_CONFIG = {
  type: 'pinecone',
  apiKey: '',            // Required. Prefer env var PINECONE_API_KEY
  indexName: 'my-index', // Name of the Pinecone index
  dimension: 1536,       // Vector dimension (must match embedding model; e.g. OpenAI text-embedding-3-small = 1536)
  metric: 'cosine',      // Similarity metric: 'cosine' | 'euclidean' | 'dotproduct'
  cloud: 'aws',          // Serverless cloud provider: 'aws' | 'gcp' | 'azure'
  region: 'us-east-1',  // Cloud region for the serverless index
  namespace: 'default',  // Fallback namespace when not specified per-operation
};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
```

---

### Step 7 — Write `tests/datasource.test.ts`

The test file covers all 14 test cases from the issue. Tests are structured in two tiers:

**Tier 1 — Unit tests (always run, mock the Pinecone SDK)**  
- Missing apiKey throws error  
- `execute()` unknown method returns 400  
- `delete` without id/ids/filter returns 400  
- `query` without vector returns 400  
- `update` without id returns 400  

**Tier 2 — Integration tests (skip if `PINECONE_API_KEY` env var is absent)**  
- `initClient()` creates index when absent  
- `initClient()` reuses index when present  
- `insert` single vector → response has id, indexName, namespace  
- `insert` batch vectors → upserted in one call  
- `query` returns topK matches with id, score, metadata  
- `query` namespace isolation  
- `query` with metadata filter  
- `update` metadata merge  
- `update` vector values replacement  
- `delete` single id  
- `delete` multiple ids  
- `delete` by filter  
- `deleteIndex` + re-init recreates index  

**Test file structure:**
```typescript
import DataSource from '../src/index';
// Mock @pinecone-database/pinecone for unit tests
jest.mock('@pinecone-database/pinecone');

const SKIP_INTEGRATION = !process.env.PINECONE_API_KEY;
const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

// Unit test suite
describe('DataSource unit tests', () => {
  it('throws if apiKey is missing', async () => { ... });
  it('returns 400 for unknown method', async () => { ... });
  // ...
});

// Integration test suite
describeIntegration('DataSource integration tests', () => {
  let ds: DataSource;
  beforeAll(async () => {
    ds = new DataSource({ apiKey: process.env.PINECONE_API_KEY, indexName: 'gs-test-...', ... });
    await ds.initClient();
  });
  afterAll(async () => { /* deleteIndex cleanup */ });
  // ...
});
```

> **Eventual-consistency note:** Integration tests that call `insert` followed by `query` must include a `await new Promise(r => setTimeout(r, 5000))` wait before querying to account for Pinecone write propagation.

---

### Step 8 — Write `README.md`

Structure:
1. **Title & badge** (consistent with other plugin READMEs)
2. **Overview** — what it does, what it does NOT do
3. **Installation** — `godspeed plugin add` + npm install command
4. **YAML Config Reference** — full annotated YAML with all keys and their defaults
5. **Environment Variables** — `PINECONE_API_KEY`
6. **Methods** — one sub-section per method with:
   - description
   - `args` schema
   - full workflow YAML snippet (complete, copy-paste-able)
   - response shape
7. **Notes on Eventual Consistency**
8. **Building & Testing**

---

### Step 9 — Update root `README.md` plugin table

Append the following row after row 11 (Apollo GraphQL) in the table that starts at line 237:

```markdown
| 12  | Pinecone | Datasource | [npm](https://www.npmjs.com/package/@godspeedsystems/plugins-pinecone-as-datasource) | [readme](./plugins/pinecone-as-datasource/README.md) | Godspeed |
```

---

## Test Cases

### Happy Path

| # | Test | Expected Result |
|---|------|----------------|
| T01 | `initClient()` with valid apiKey, index does NOT exist | Index created via `createIndex(waitUntilReady: true)`; `this.client` is a Pinecone `Index` handle |
| T02 | `initClient()` with valid apiKey, index already EXISTS | `createIndex` is NOT called; existing index handle is returned |
| T03 | `insert` — single `{ id, values, metadata }` | `upsert()` called once; response `{ ids: ['vec1'], indexName, namespace }` with `success: true, code: 200` |
| T04 | `insert` — array of 3 documents | Single `upsert()` call with all 3; response `ids` array has length 3 |
| T05 | `query` with `vector`, `topK: 3` | Returns `GSStatus(true, 200)` with `matches` array length ≤ 3, each entry has `id`, `score`, `metadata` |
| T06 | `query` scoped to namespace A after inserting in namespace B | `matches` array is empty (namespace isolation) |
| T07 | `query` with `filter: { category: 'news' }` | Only matches with `metadata.category === 'news'` returned |
| T08 | `update` — new `metadata` fields | Pinecone `update({ id, setMetadata })` called; subsequent query shows updated metadata |
| T09 | `update` — new `values` | `update({ id, values })` called |
| T10 | `delete` — single `id` | `deleteOne(id)` called; response `{ id, indexName, namespace }` |
| T11 | `delete` — `ids` array `['a','b']` | `deleteMany(['a','b'])` called |
| T12 | `delete` — `filter` object | `deleteMany({ filter })` called |
| T13 | `deleteIndex` | `pineconeClient.deleteIndex(indexName)` called; response `{ indexName }` |
| T14 | After `deleteIndex`, re-run `initClient()` | Index is recreated (`createIndex` is called again) |

### Edge Cases

| # | Test | Expected Result |
|---|------|----------------|
| E01 | `insert` with a single object (not array) in `documents` | Plugin wraps it in an array; upsert succeeds |
| E02 | `query` with `topK` not specified | Defaults to `10` |
| E03 | `query` returns zero matches | `matches: []`, `success: true`, `code: 200` |
| E04 | Operation without `namespace` in args | Falls back to `this.config.namespace`, then `'default'` |
| E05 | `update` with both `values` and `metadata` | Both applied in a single `update()` call |
| E06 | `deleteIndex` then `execute()` any method | Re-init required before operations succeed (not auto-recovered by plugin) |

### Error Cases

| # | Test | Expected Result |
|---|------|----------------|
| ER01 | `initClient()` called with `apiKey: ''` or missing | Throws `Error` with message containing `'apiKey is required'` — plugin never starts |
| ER02 | `execute()` with `method: 'unknownOp'` | Returns `GSStatus(false, 400)` with message listing valid methods |
| ER03 | `delete` called without `id`, `ids`, or `filter` | Returns `GSStatus(false, 400, 'delete requires id, ids, or filter')` |
| ER04 | `query` called without `vector` | Returns `GSStatus(false, 400, 'vector is required for query')` |
| ER05 | `update` called without `id` | Returns `GSStatus(false, 400, 'id is required for update')` |
| ER06 | Pinecone SDK throws (e.g., network error, 401 Unauthorized) | `execute()` catches it, returns `GSStatus(false, statusCode, 'Pinecone <method> error', { error: message })` |

---

## Validation Checklist

### Structure & Exports
- [ ] Plugin directory is `plugins/pinecone-as-datasource/` (not `datastore`, not `eventsource`)
- [ ] `src/index.ts` default export is `DataSource extends GSDataSource`
- [ ] Named exports present: `DataSource`, `SourceType`, `Type`, `CONFIG_FILE_NAME`, `DEFAULT_CONFIG`
- [ ] `SourceType === 'DS'`
- [ ] `Type === 'pinecone'`
- [ ] `CONFIG_FILE_NAME === 'pinecone'`
- [ ] `DEFAULT_CONFIG` documents all 7 config keys with correct defaults

### TypeScript Build
- [ ] `npm run build` inside `plugins/pinecone-as-datasource/` exits with code 0
- [ ] `dist/index.js` and `dist/index.d.ts` are emitted
- [ ] No `@ts-ignore` suppressions except where unavoidable (with inline comment explaining why)
- [ ] `strict: true` passes (no implicit `any` without explicit casts)

### `initClient()` behaviour
- [ ] Throws `Error` synchronously if `apiKey` is falsy (before any Pinecone SDK call)
- [ ] Calls `pinecone.listIndexes()` exactly once
- [ ] Calls `pinecone.createIndex(...)` only when the index is absent
- [ ] `waitUntilReady: true` is set on `createIndex`
- [ ] Stores `pineconeClient` on `this` for later use by `deleteIndex`
- [ ] Returns the `Index` handle (not the root `Pinecone` instance) so `this.client` is namespace-capable

### `execute()` — five operations
- [ ] `insert` — wraps a single document in an array; calls `ns.upsert()`; response includes `ids`, `indexName`, `namespace`
- [ ] `insert` — passes a batch array through unchanged in a single `upsert()` call
- [ ] `query` — requires `vector`; passes `topK` (default 10), `filter`, `includeMetadata` (default true); maps response to `{ id, score, metadata }`
- [ ] `query` — namespace is correctly scoped via `index.namespace(namespace)` so cross-namespace isolation holds
- [ ] `update` — forwards `id`, optional `values`, optional `setMetadata`; returns 200
- [ ] `delete` — routes to `deleteOne(id)` / `deleteMany(ids)` / `deleteMany({ filter })` depending on args present
- [ ] `deleteIndex` — calls `this.pineconeClient.deleteIndex(indexName)`, not the index handle
- [ ] Unknown method returns `GSStatus(false, 400, ...)`
- [ ] All SDK errors are caught; never throws out of `execute()`; always returns `GSStatus`

### Namespace handling
- [ ] Namespace defaults to `this.config.namespace` if `args.namespace` is absent
- [ ] Falls back to `'default'` if neither `args.namespace` nor `config.namespace` is set

### Tests
- [ ] `npm test` runs without error (unit tests always pass; integration tests skipped when `PINECONE_API_KEY` is absent)
- [ ] All 14 test cases from the issue have a corresponding `it()` block
- [ ] Integration tests clean up after themselves (delete test index in `afterAll`)
- [ ] `eventual-consistency` wait (≥ 5 s) is present between insert and query in integration tests

### Documentation
- [ ] `README.md` includes full annotated YAML config
- [ ] Every method has a complete workflow YAML snippet that can be copy-pasted
- [ ] `PINECONE_API_KEY` env var usage documented
- [ ] "Does not generate embeddings" disclaimer present
- [ ] "Serverless only" limitation called out

### Root README
- [ ] Row 12 added to plugin table with correct npm link and readme path
- [ ] No other rows disrupted / renumbered

### npm Publish Readiness
- [ ] `package.json` `"publishConfig": { "access": "public" }` present
- [ ] `.npmignore` excludes `src/`, `tests/`, `tsconfig.json`
- [ ] `prepublishOnly` script runs `build` before publish
