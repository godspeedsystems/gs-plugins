# Pinecone DataSource Plugin

![npm (scoped)](https://img.shields.io/npm/v/@godspeedsystems/plugins-pinecone-as-datasource)
![License](https://img.shields.io/badge/license-Godspeed%20License%201.0-blue)

A Godspeed DataSource plugin for seamless integration with [Pinecone](https://www.pinecone.io/), a managed serverless vector database. Declare your Pinecone configuration entirely in YAML and execute vector operations (`insert`, `update`, `delete`, `query`, `deleteIndex`) directly in workflows.

## Overview

This plugin provides:
- **Five core vector operations**: insert, update, delete, query, deleteIndex
- **Declarative YAML configuration**: No custom code needed
- **Namespace isolation**: Scope operations to logical data partitions
- **Metadata filtering**: Query with rich metadata constraints
- **Batch operations**: Insert/delete multiple vectors efficiently
- **Serverless support**: Works with Pinecone serverless indexes

### What This Plugin Does NOT Do

- **Does not generate embeddings**: Provide pre-computed vectors (e.g., from OpenAI, Cohere)
- **Serverless only**: Does not support pod-based Pinecone indexes; requires serverless infrastructure
- **No custom metrics**: Limited to `cosine`, `euclidean`, `dotproduct`

---

## Installation

### 1. Install the plugin

```bash
godspeed plugin add @godspeedsystems/plugins-pinecone-as-datasource
```

Or manually install via npm:

```bash
npm install @godspeedsystems/plugins-pinecone-as-datasource
```

### 2. Set your API key

Export your Pinecone API key:

```bash
export PINECONE_API_KEY="your-api-key-here"
```

Or set it directly in your datasource YAML (not recommended for production).

---

## YAML Configuration Reference

### Datasource File: `src/datasources/pinecone.yaml`

```yaml
type: pinecone                 # Required: type identifier
apiKey: ${PINECONE_API_KEY}    # Required: Pinecone API key (prefer env var)
indexName: my-vectors          # Required: Name of your Pinecone index
dimension: 1536                # Optional: Vector dimension (default: 1536)
                               # Must match your embedding model
                               # e.g., OpenAI text-embedding-3-small = 1536
metric: cosine                 # Optional: Similarity metric
                               # Options: 'cosine' | 'euclidean' | 'dotproduct'
                               # Default: 'cosine'
cloud: aws                     # Optional: Serverless cloud provider
                               # Options: 'aws' | 'gcp' | 'azure'
                               # Default: 'aws'
region: us-east-1              # Optional: Cloud region for serverless index
                               # Default: 'us-east-1'
namespace: default             # Optional: Default namespace for operations
                               # If not specified per-operation, uses this value
                               # Default: 'default'
```

### Full Example with Defaults

```yaml
type: pinecone
apiKey: ${PINECONE_API_KEY}
indexName: production-vectors
dimension: 1536
metric: cosine
cloud: aws
region: us-east-1
namespace: default
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PINECONE_API_KEY` | Yes | Your Pinecone API key from the console |

---

## Methods

### 1. `insert` — Upsert Vectors

Insert one or more vectors into the index. If a vector with the same ID already exists, it is replaced.

#### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `documents` | Object \| Array | Yes | Single document or array of documents. Each document: `{ id: string, values: number[], metadata?: object }` |
| `namespace` | string | No | Target namespace. Defaults to config namespace or `'default'` |

#### Response

```json
{
  "success": true,
  "code": 200,
  "message": "Vectors upserted successfully",
  "data": {
    "ids": ["vec-1", "vec-2"],
    "indexName": "my-vectors",
    "namespace": "default"
  }
}
```

#### Workflow Example — Single Vector

```yaml
id: insert_single_vector
tasks:
  - id: upsert_embedding
    fn: datasource.pinecone.insert
    args:
      documents:
        id: doc-123
        values: [0.1, 0.2, 0.3, ...]  # 1536 values (or your dimension)
        metadata:
          source: document
          title: "Hello World"
          timestamp: 2024-01-01
```

#### Workflow Example — Batch Insert

```yaml
id: insert_batch_vectors
tasks:
  - id: bulk_upsert
    fn: datasource.pinecone.insert
    args:
      documents:
        - id: doc-1
          values: [0.1, 0.2, 0.3, ...]
          metadata: { source: "blog", category: "tech" }
        - id: doc-2
          values: [0.4, 0.5, 0.6, ...]
          metadata: { source: "news", category: "tech" }
        - id: doc-3
          values: [0.7, 0.8, 0.9, ...]
          metadata: { source: "paper", category: "research" }
      namespace: articles
```

---

### 2. `query` — Search Vectors by Similarity

Query the index with a vector and retrieve the most similar vectors.

#### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vector` | number[] | Yes | Query vector (must match configured dimension) |
| `topK` | number | No | Number of results to return (default: 10) |
| `filter` | object | No | Metadata filter (e.g., `{ category: "tech" }`) |
| `includeMetadata` | boolean | No | Include metadata in results (default: true) |
| `includeValues` | boolean | No | Include vector values in results (default: false) |
| `namespace` | string | No | Target namespace (default: config namespace) |

#### Response

```json
{
  "success": true,
  "code": 200,
  "message": "Query successful",
  "data": {
    "matches": [
      {
        "id": "doc-1",
        "score": 0.95,
        "metadata": { "source": "blog", "category": "tech" }
      },
      {
        "id": "doc-2",
        "score": 0.87,
        "metadata": { "source": "news", "category": "tech" }
      }
    ],
    "namespace": "default",
    "indexName": "my-vectors"
  }
}
```

#### Workflow Example — Basic Query

```yaml
id: semantic_search
tasks:
  - id: find_similar
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3, ...]  # Your query embedding
      topK: 5
```

#### Workflow Example — Query with Filter

```yaml
id: filtered_semantic_search
tasks:
  - id: find_tech_articles
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3, ...]
      topK: 10
      filter:
        category: tech
        year:
          $gte: 2023
      includeMetadata: true
```

#### Workflow Example — Namespace-Scoped Query

```yaml
id: query_specific_namespace
tasks:
  - id: search_articles
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3, ...]
      namespace: articles
      topK: 5
```

---

### 3. `update` — Update Vector or Metadata

Update a vector's values, metadata, or both. Only the fields provided are updated.

#### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Vector ID to update |
| `values` | number[] | No | New vector values |
| `metadata` | object | No | Metadata to merge/replace |
| `namespace` | string | No | Target namespace |

#### Response

```json
{
  "success": true,
  "code": 200,
  "message": "Vector updated successfully",
  "data": {
    "id": "doc-123",
    "indexName": "my-vectors",
    "namespace": "default"
  }
}
```

#### Workflow Example — Update Metadata Only

```yaml
id: update_metadata
tasks:
  - id: refresh_document_status
    fn: datasource.pinecone.update
    args:
      id: doc-123
      metadata:
        status: archived
        reviewed_at: 2024-01-15
        reviewer: admin
```

#### Workflow Example — Update Vector Values

```yaml
id: update_embedding
tasks:
  - id: recompute_vector
    fn: datasource.pinecone.update
    args:
      id: doc-123
      values: [0.5, 0.6, 0.7, ...]  # New embedding
```

#### Workflow Example — Update Both

```yaml
id: full_update
tasks:
  - id: refresh_all
    fn: datasource.pinecone.update
    args:
      id: doc-123
      values: [0.5, 0.6, 0.7, ...]
      metadata:
        version: 2
        updated_at: 2024-01-15
        embedding_model: text-embedding-3-small
```

---

### 4. `delete` — Delete Vectors

Delete one or more vectors by ID, or by metadata filter.

#### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | No | Single vector ID to delete |
| `ids` | string[] | No | Array of vector IDs to delete |
| `filter` | object | No | Metadata filter to delete all matching vectors |
| `namespace` | string | No | Target namespace |

**Note:** Specify exactly one of `id`, `ids`, or `filter`.

#### Response

```json
{
  "success": true,
  "code": 200,
  "message": "Vector deleted",
  "data": {
    "id": "doc-123",
    "indexName": "my-vectors",
    "namespace": "default"
  }
}
```

#### Workflow Example — Delete Single Vector

```yaml
id: delete_vector
tasks:
  - id: remove_document
    fn: datasource.pinecone.delete
    args:
      id: doc-123
```

#### Workflow Example — Delete Multiple Vectors

```yaml
id: delete_batch
tasks:
  - id: remove_documents
    fn: datasource.pinecone.delete
    args:
      ids:
        - doc-1
        - doc-2
        - doc-3
```

#### Workflow Example — Delete by Filter

```yaml
id: delete_by_filter
tasks:
  - id: purge_archived
    fn: datasource.pinecone.delete
    args:
      filter:
        status: archived
        archived_before: 2023-12-31
      namespace: old_data
```

---

### 5. `deleteIndex` — Delete Entire Index

Delete the entire Pinecone index. All vectors and data are permanently removed.

#### Arguments

None (uses `indexName` from datasource config).

#### Response

```json
{
  "success": true,
  "code": 200,
  "message": "Index 'my-vectors' deleted",
  "data": {
    "indexName": "my-vectors"
  }
}
```

#### Workflow Example

```yaml
id: destroy_index
tasks:
  - id: nuke_index
    fn: datasource.pinecone.deleteIndex
```

---

## Notes on Eventual Consistency

Pinecone is eventually consistent. After inserting or updating vectors, there is a slight delay (typically 1–5 seconds) before they appear in query results. 

**If you immediately query after insert**, the new vector may not be in results.

**Recommended approach:**
- In automated workflows, add a 5–10 second delay between insert and query:

```yaml
id: insert_and_query_workflow
tasks:
  - id: insert_vectors
    fn: datasource.pinecone.insert
    args:
      documents:
        id: new-doc
        values: [0.1, 0.2, 0.3, ...]

  - id: wait_for_consistency
    fn: system.delay
    args:
      ms: 5000

  - id: query_vectors
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3, ...]
      topK: 5
```

---

## Building and Testing

### Build from Source

```bash
npm install
npm run build
```

Outputs:
- `dist/index.js` — Compiled JavaScript
- `dist/index.d.ts` — TypeScript type definitions

### Run Tests

```bash
# Unit tests only (mocked, always pass)
npm test

# Integration tests (require PINECONE_API_KEY env var)
export PINECONE_API_KEY="your-key"
npm test
```

Test coverage:
- **Unit tests**: 10+ tests covering all error paths and edge cases
- **Integration tests**: 14+ tests covering real Pinecone operations

---

## Troubleshooting

### `apiKey is required` Error

**Cause:** `apiKey` is not set in datasource YAML or `PINECONE_API_KEY` env var.

**Solution:**
```yaml
# In src/datasources/pinecone.yaml
apiKey: ${PINECONE_API_KEY}
```

Then export:
```bash
export PINECONE_API_KEY="your-key-from-pinecone-console"
```

### `Index not found` Error

**Cause:** The index name in config does not match any index in your Pinecone account.

**Solution:**
- Check index name in `indexName` field
- Verify the API key has access to that index
- The plugin will auto-create the index on first `initClient()` if it does not exist

### `Query returns no matches`

**Cause:** Vectors not yet consistent in the index (see "Eventual Consistency" above).

**Solution:**
- Add a 5–10 second delay after insert before querying
- Or insert vectors ahead of time in a separate workflow

### `Dimension mismatch` Error

**Cause:** Vector dimension in `values` does not match `dimension` in config.

**Solution:**
```yaml
# If using OpenAI text-embedding-3-small (1536 dimensions):
dimension: 1536

# Ensure all vectors have 1536 values:
values: [0.1, 0.2, ..., 0.X]  # Length must be 1536
```

---

## Support

For issues, feature requests, or questions:
- GitHub: [Godspeed Plugins](https://github.com/godspeedsystems)
- Email: support@godspeed.systems
- Docs: [Godspeed Framework](https://godspeed.systems)

---

## License

Godspeed License 1.0
