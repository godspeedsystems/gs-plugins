# Pinecone as Datasource Plugin

This plugin integrates Pinecone vector database with Godspeed Framework, enabling you to perform vector operations like insert, query, update, and delete in your Godspeed workflows.

## Installation

```bash
npm install @godspeedsystems/plugins-pinecone-as-datasource
```

## Configuration

Create a `src/datasources/pinecone.yaml` file in your Godspeed project:

```yaml
type: pinecone
config:
  api_key: <your-pinecone-api-key>
  index_name: <your-index-name>
```

Or use environment variables:

```yaml
type: pinecone
config:
  api_key: ${PINECONE_API_KEY}
  index_name: ${PINECONE_INDEX_NAME}
```

## Configuration Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `api_key` | string | Yes | Pinecone API key for authentication |
| `index_name` | string | Yes | Name of the Pinecone index to use |

## Operations

### Insert Vectors

Insert or upsert vectors into the index.

**Workflow Example:**

```yaml
tasks:
  - id: insert_vectors
    fn: datasource.pinecone.insert
    args:
      vectors:
        - id: "1"
          values: [0.1, 0.2, 0.3]
          metadata:
            text: "Example text"
        - id: "2"
          values: [0.4, 0.5, 0.6]
          metadata:
            text: "Another example"
```

### Query Vectors

Query the index to find similar vectors.

**Workflow Example:**

```yaml
tasks:
  - id: query_vectors
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3]
      top_k: 10
      includeMetadata: true
      filter:
        status: "active"
```

### Update Vector

Update a vector's values or metadata.

**Workflow Example:**

```yaml
tasks:
  - id: update_vector
    fn: datasource.pinecone.update
    args:
      id: "1"
      values: [0.15, 0.25, 0.35]
      metadata:
        text: "Updated text"
```

### Delete Vectors

Delete vectors from the index.

**Workflow Example:**

```yaml
# Delete by IDs
tasks:
  - id: delete_by_ids
    fn: datasource.pinecone.delete
    args:
      ids:
        - "1"
        - "2"

# Delete by filter
tasks:
  - id: delete_by_filter
    fn: datasource.pinecone.delete
    args:
      filter:
        status: "inactive"

# Delete all vectors
tasks:
  - id: delete_all
    fn: datasource.pinecone.delete
    args:
      deleteAll: true
```

### Delete Index

Delete the entire Pinecone index.

**Workflow Example:**

```yaml
tasks:
  - id: delete_index
    fn: datasource.pinecone.deleteIndex
```

## API Reference

### Insert

Inserts or updates vectors in the index.

**Parameters:**
- `vectors` (required): Array of vector objects with `id`, `values`, and optional `metadata`

**Response:** GSStatus with upserted count

### Query

Queries the index for similar vectors.

**Parameters:**
- `vector` (required): Array of numbers representing the vector to search with
- `top_k` (optional): Number of results to return (default: 10)
- `filter` (optional): Metadata filter object
- `includeMetadata` (optional): Include metadata in results (default: true)

**Response:** GSStatus with matches array

### Update

Updates a vector's values or metadata.

**Parameters:**
- `id` (required): ID of the vector to update
- `values` (optional): New vector values
- `metadata` (optional): New metadata object
- `sparseValues` (optional): Sparse vector values

**Response:** GSStatus with update result

### Delete

Deletes vectors from the index.

**Parameters:**
- `ids` (optional): Array of vector IDs to delete
- `filter` (optional): Metadata filter to delete matching vectors
- `deleteAll` (optional): Delete all vectors if true

**Response:** GSStatus with deletion count

### DeleteIndex

Deletes the entire index.

**Parameters:** None

**Response:** GSStatus with deletion status

## Error Handling

All operations return a GSStatus object:

```typescript
{
  success: boolean,
  code: number,
  message?: string,
  data?: any
}
```

Error codes:
- `400`: Bad request (missing or invalid parameters)
- `500`: Internal server error (Pinecone API error)

## Example Workflow

```yaml
id: pinecone_workflow
tasks:
  - id: insert_task
    fn: datasource.pinecone.insert
    args:
      vectors:
        - id: "doc1"
          values: [0.1, 0.2, 0.3, 0.4]
          metadata:
            source: "document"

  - id: query_task
    fn: datasource.pinecone.query
    args:
      vector: [0.1, 0.2, 0.3, 0.4]
      top_k: 5
      includeMetadata: true

  - id: update_task
    fn: datasource.pinecone.update
    args:
      id: "doc1"
      metadata:
        processed: true

  - id: delete_task
    fn: datasource.pinecone.delete
    args:
      ids:
        - "doc1"
```

## Support

For issues or questions, please refer to the [Godspeed Framework documentation](https://docs.godspeed.systems) or create an issue in the [gs-plugins repository](https://github.com/godspeedsystems/gs-plugins).
