import DataSource from '../src/index';
import { GSContext, GSStatus } from '@godspeedsystems/core';
import { Pinecone } from '@pinecone-database/pinecone';

// Mock @pinecone-database/pinecone for unit tests
jest.mock('@pinecone-database/pinecone');

const SKIP_INTEGRATION = !process.env.PINECONE_API_KEY;
const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

// ========== UNIT TESTS (Mock-based) ==========
describe('DataSource unit tests', () => {
  let mockPinecone: jest.Mocked<any>;
  let mockIndex: jest.Mocked<any>;
  let mockNamespace: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock namespace
    mockNamespace = {
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      deleteOne: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
      query: jest.fn().mockResolvedValue({ matches: [] }),
    };

    // Setup mock index
    mockIndex = {
      namespace: jest.fn().mockReturnValue(mockNamespace),
    };

    // Setup mock Pinecone instance
    mockPinecone = {
      listIndexes: jest.fn().mockResolvedValue({ indexes: [] }),
      createIndex: jest.fn().mockResolvedValue({}),
      deleteIndex: jest.fn().mockResolvedValue({}),
      index: jest.fn().mockReturnValue(mockIndex),
    };

    // Mock the Pinecone constructor
    (Pinecone as any).mockImplementation(() => mockPinecone);
  });

  // ER01: Missing apiKey throws error
  it('ER01: throws if apiKey is missing', async () => {
    const ds = new DataSource({
      indexName: 'test-index',
      apiKey: '',
    });

    await expect(ds.initClient()).rejects.toThrow('apiKey is required');
  });

  // ER02: Unknown method returns 400
  it('ER02: returns 400 for unknown method', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    // Initialize the client
    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'unknownOp',
      meta: { fnNameInWorkflow: 'ds.pinecone.unknownOp' },
    });

    expect(result.statusCode).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown method');
  });

  // ER03: Delete without id/ids/filter returns 400
  it('ER03: delete without id, ids, or filter returns 400', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'delete',
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(result.statusCode).toBe(400);
    expect(result.message).toContain('delete requires id, ids, or filter');
  });

  // ER04: Query without vector returns 400
  it('ER04: query without vector returns 400', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'query',
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(result.statusCode).toBe(400);
    expect(result.message).toContain('vector is required');
  });

  // ER05: Update without id returns 400
  it('ER05: update without id returns 400', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'update',
      values: [1, 2, 3],
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(result.statusCode).toBe(400);
    expect(result.message).toContain('id is required');
  });

  // ER06: SDK error handling
  it('ER06: catches Pinecone SDK errors and returns GSStatus with error details', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    const mockError = new Error('Network error');
    mockNamespace.upsert.mockRejectedValueOnce(mockError);

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'insert',
      documents: { id: 'test', values: [1, 2, 3] },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
    expect(result.message).toContain('Pinecone insert error');
  });

  // Happy path: T03 - Insert single document
  it('T03: insert single document wraps in array and returns ids', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'insert',
      documents: { id: 'vec1', values: [0.1, 0.2, 0.3], metadata: { type: 'test' } },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.ids).toEqual(['vec1']);
    expect(result.data.indexName).toBe('test-index');
    expect(result.data.namespace).toBe('default');
    expect(mockNamespace.upsert).toHaveBeenCalledWith([
      { id: 'vec1', values: [0.1, 0.2, 0.3], metadata: { type: 'test' } },
    ]);
  });

  // T04: Insert batch of documents
  it('T04: insert array of documents calls upsert once with all documents', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const docs = [
      { id: 'vec1', values: [0.1, 0.2] },
      { id: 'vec2', values: [0.3, 0.4] },
      { id: 'vec3', values: [0.5, 0.6] },
    ];

    const result = await ds.execute(mockCtx, {
      method: 'insert',
      documents: docs,
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(result.success).toBe(true);
    expect(result.data.ids).toHaveLength(3);
    expect(mockNamespace.upsert).toHaveBeenCalledWith(docs);
  });

  // T05: Query with vector and topK
  it('T05: query returns matches with id, score, metadata', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    const mockMatches = [
      { id: 'vec1', score: 0.95, metadata: { text: 'hello' } },
      { id: 'vec2', score: 0.87, metadata: { text: 'world' } },
    ];

    mockNamespace.query.mockResolvedValueOnce({ matches: mockMatches });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'query',
      vector: [0.1, 0.2, 0.3],
      topK: 3,
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.matches).toHaveLength(2);
    expect(result.data.matches[0]).toEqual({
      id: 'vec1',
      score: 0.95,
      metadata: { text: 'hello' },
    });
  });

  // E02: Query with topK defaults to 10
  it('E02: query topK defaults to 10 when not specified', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    mockNamespace.query.mockResolvedValueOnce({ matches: [] });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    await ds.execute(mockCtx, {
      method: 'query',
      vector: [0.1, 0.2],
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(mockNamespace.query).toHaveBeenCalledWith(
      expect.objectContaining({
        topK: 10,
      })
    );
  });

  // E03: Query returns empty matches
  it('E03: query returns zero matches as empty array', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    mockNamespace.query.mockResolvedValueOnce({ matches: [] });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'query',
      vector: [0.1, 0.2],
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.matches).toEqual([]);
  });

  // E04: Operation without namespace falls back to config namespace then 'default'
  it('E04: namespace defaults to config.namespace then "default"', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
      namespace: 'custom-ns',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'custom-ns' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    await ds.execute(mockCtx, {
      method: 'insert',
      documents: { id: 'test', values: [1, 2] },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(mockIndex.namespace).toHaveBeenCalledWith('custom-ns');
  });

  // T10: Delete single id
  it('T10: delete single id calls deleteOne', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'delete',
      id: 'vec1',
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(mockNamespace.deleteOne).toHaveBeenCalledWith('vec1');
    expect(result.success).toBe(true);
    expect(result.data.id).toBe('vec1');
  });

  // T11: Delete multiple ids
  it('T11: delete multiple ids calls deleteMany with array', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'delete',
      ids: ['a', 'b', 'c'],
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(mockNamespace.deleteMany).toHaveBeenCalledWith(['a', 'b', 'c']);
    expect(result.success).toBe(true);
    expect(result.data.ids).toEqual(['a', 'b', 'c']);
  });

  // T12: Delete by filter
  it('T12: delete by filter calls deleteMany with filter', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const filterObj = { status: 'archived' };

    const result = await ds.execute(mockCtx, {
      method: 'delete',
      filter: filterObj,
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(mockNamespace.deleteMany).toHaveBeenCalledWith({ filter: filterObj });
    expect(result.success).toBe(true);
  });

  // T08: Update metadata
  it('T08: update with metadata calls update with setMetadata', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const newMetadata = { status: 'updated', tags: ['new'] };

    const result = await ds.execute(mockCtx, {
      method: 'update',
      id: 'vec1',
      metadata: newMetadata,
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(mockNamespace.update).toHaveBeenCalledWith({
      id: 'vec1',
      setMetadata: newMetadata,
    });
    expect(result.success).toBe(true);
  });

  // T09: Update values
  it('T09: update with values calls update with values', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const newValues = [0.5, 0.6, 0.7];

    await ds.execute(mockCtx, {
      method: 'update',
      id: 'vec1',
      values: newValues,
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(mockNamespace.update).toHaveBeenCalledWith({
      id: 'vec1',
      values: newValues,
    });
  });

  // E05: Update with both values and metadata
  it('E05: update with both values and metadata applies both', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const newValues = [0.5, 0.6];
    const newMetadata = { updated: true };

    await ds.execute(mockCtx, {
      method: 'update',
      id: 'vec1',
      values: newValues,
      metadata: newMetadata,
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(mockNamespace.update).toHaveBeenCalledWith({
      id: 'vec1',
      values: newValues,
      setMetadata: newMetadata,
    });
  });

  // T13: DeleteIndex
  it('T13: deleteIndex calls pineconeClient.deleteIndex', async () => {
    const ds = new DataSource({
      apiKey: 'test-key',
      indexName: 'test-index',
    });

    ds['client'] = mockIndex;
    ds['pineconeClient'] = mockPinecone;
    ds['config'] = { apiKey: 'test-key', indexName: 'test-index', namespace: 'default' };

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'deleteIndex',
      meta: { fnNameInWorkflow: 'ds.pinecone.deleteIndex' },
    });

    expect(mockPinecone.deleteIndex).toHaveBeenCalledWith('test-index');
    expect(result.success).toBe(true);
    expect(result.data.indexName).toBe('test-index');
  });
});

// ========== INTEGRATION TESTS (Real Pinecone) ==========
describeIntegration('DataSource integration tests', () => {
  let ds: DataSource;
  const testIndexName = `gs-test-${Date.now()}`;

  beforeAll(async () => {
    ds = new DataSource({
      apiKey: process.env.PINECONE_API_KEY!,
      indexName: testIndexName,
      dimension: 1536,
      metric: 'cosine',
      cloud: 'aws',
      region: 'us-east-1',
    });

    await ds.initClient();
    // Wait for index to be ready
    await new Promise((r) => setTimeout(r, 5000));
  });

  afterAll(async () => {
    // Cleanup: delete the test index
    if (ds && ds['pineconeClient']) {
      try {
        await ds['pineconeClient'].deleteIndex(testIndexName);
      } catch (e) {
        // Index may already be deleted
      }
    }
  });

  // T01: Create index when absent
  it('T01: initClient creates index when absent', async () => {
    expect(ds['client']).toBeDefined();
    expect(ds['pineconeClient']).toBeDefined();
  });

  // T02: Reuse existing index
  it('T02: initClient reuses existing index', async () => {
    const ds2 = new DataSource({
      apiKey: process.env.PINECONE_API_KEY!,
      indexName: testIndexName,
      dimension: 1536,
      metric: 'cosine',
    });

    // Should not throw; should reuse the existing index
    const client = await ds2.initClient();
    expect(client).toBeDefined();
  });

  // T03: Insert single vector
  it('T03: insert single vector stores in index', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'test-vec-1',
        values: Array(1536).fill(0.1),
        metadata: { type: 'test', text: 'hello' },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(result.success).toBe(true);
    expect(result.data.ids).toContain('test-vec-1');
  });

  // T04: Insert batch vectors
  it('T04: insert batch of vectors', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const docs = [
      { id: 'batch-1', values: Array(1536).fill(0.2), metadata: { group: 'batch' } },
      { id: 'batch-2', values: Array(1536).fill(0.3), metadata: { group: 'batch' } },
      { id: 'batch-3', values: Array(1536).fill(0.4), metadata: { group: 'batch' } },
    ];

    const result = await ds.execute(mockCtx, {
      method: 'insert',
      documents: docs,
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    expect(result.success).toBe(true);
    expect(result.data.ids).toHaveLength(3);
  });

  // T05: Query returns topK matches
  it('T05: query returns matches with scores and metadata', async () => {
    // Wait for write propagation
    await new Promise((r) => setTimeout(r, 5000));

    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    const result = await ds.execute(mockCtx, {
      method: 'query',
      vector: Array(1536).fill(0.2),
      topK: 2,
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(result.success).toBe(true);
    expect(result.data.matches.length).toBeLessThanOrEqual(2);
    if (result.data.matches.length > 0) {
      expect(result.data.matches[0]).toHaveProperty('id');
      expect(result.data.matches[0]).toHaveProperty('score');
      expect(result.data.matches[0]).toHaveProperty('metadata');
    }
  });

  // T06: Namespace isolation
  it('T06: query in different namespace is isolated', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Insert in namespace A
    await ds.execute(mockCtx, {
      method: 'insert',
      namespace: 'ns-a',
      documents: {
        id: 'ns-a-vec',
        values: Array(1536).fill(0.5),
        metadata: { ns: 'a' },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Wait for write propagation
    await new Promise((r) => setTimeout(r, 5000));

    // Query in namespace B (different)
    const result = await ds.execute(mockCtx, {
      method: 'query',
      namespace: 'ns-b',
      vector: Array(1536).fill(0.5),
      topK: 10,
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    // Should not find the vector inserted in namespace A
    expect(result.success).toBe(true);
    // Namespace B should not contain vectors inserted in namespace A
    expect(result.data.matches.length).toBe(0);
  });

  // T07: Query with metadata filter
  it('T07: query with metadata filter', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Insert with specific metadata
    await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'filtered-vec',
        values: Array(1536).fill(0.6),
        metadata: { category: 'news', priority: 'high' },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Wait for write propagation
    await new Promise((r) => setTimeout(r, 5000));

    // Query with filter
    const result = await ds.execute(mockCtx, {
      method: 'query',
      vector: Array(1536).fill(0.6),
      filter: { category: 'news' },
      topK: 10,
      meta: { fnNameInWorkflow: 'ds.pinecone.query' },
    });

    expect(result.success).toBe(true);
    // Verify all matches have the expected metadata
    for (const match of result.data.matches) {
      expect(match.metadata?.category).toBe('news');
    }
  });

  // T08: Update metadata
  it('T08: update metadata merge', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // First insert
    await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'update-vec',
        values: Array(1536).fill(0.7),
        metadata: { status: 'active' },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Update metadata
    const result = await ds.execute(mockCtx, {
      method: 'update',
      id: 'update-vec',
      metadata: { status: 'inactive', updated_at: '2024-01-01' },
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(result.success).toBe(true);
  });

  // T09: Update vector values
  it('T09: update vector values', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // First insert
    await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'update-values-vec',
        values: Array(1536).fill(0.1),
        metadata: { version: 1 },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Update values
    const result = await ds.execute(mockCtx, {
      method: 'update',
      id: 'update-values-vec',
      values: Array(1536).fill(0.9),
      meta: { fnNameInWorkflow: 'ds.pinecone.update' },
    });

    expect(result.success).toBe(true);
  });

  // T10: Delete single id
  it('T10: delete single vector by id', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Insert first
    await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'delete-vec-1',
        values: Array(1536).fill(0.8),
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Delete
    const result = await ds.execute(mockCtx, {
      method: 'delete',
      id: 'delete-vec-1',
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('delete-vec-1');
  });

  // T11: Delete multiple ids
  it('T11: delete multiple vectors by ids', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Insert multiple
    const ids = ['multi-del-1', 'multi-del-2', 'multi-del-3'];
    for (const id of ids) {
      await ds.execute(mockCtx, {
        method: 'insert',
        documents: { id, values: Array(1536).fill(0.5) },
        meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
      });
    }

    // Delete multiple
    const result = await ds.execute(mockCtx, {
      method: 'delete',
      ids,
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(result.success).toBe(true);
    expect(result.data.ids).toEqual(ids);
  });

  // T12: Delete by filter
  it('T12: delete vectors by filter', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Insert with specific metadata
    await ds.execute(mockCtx, {
      method: 'insert',
      documents: {
        id: 'filter-del-vec',
        values: Array(1536).fill(0.4),
        metadata: { to_delete: true, reason: 'test' },
      },
      meta: { fnNameInWorkflow: 'ds.pinecone.insert' },
    });

    // Delete by filter
    const result = await ds.execute(mockCtx, {
      method: 'delete',
      filter: { to_delete: true },
      meta: { fnNameInWorkflow: 'ds.pinecone.delete' },
    });

    expect(result.success).toBe(true);
  });

  // T14: Delete and recreate index
  it('T14: deleteIndex and reinit recreates index', async () => {
    const mockCtx = {
      childLogger: { error: jest.fn() },
    } as unknown as GSContext;

    // Create a separate index for this test
    const tempIndexName = `gs-test-temp-${Date.now()}`;
    const tempDs = new DataSource({
      apiKey: process.env.PINECONE_API_KEY!,
      indexName: tempIndexName,
      dimension: 1536,
    });

    await tempDs.initClient();
    await new Promise((r) => setTimeout(r, 5000));

    // Delete index
    const deleteResult = await tempDs.execute(mockCtx, {
      method: 'deleteIndex',
      meta: { fnNameInWorkflow: 'ds.pinecone.deleteIndex' },
    });

    expect(deleteResult.success).toBe(true);
    await new Promise((r) => setTimeout(r, 5000));

    // Reinit (should recreate)
    const tempDs2 = new DataSource({
      apiKey: process.env.PINECONE_API_KEY!,
      indexName: tempIndexName,
      dimension: 1536,
    });

    const reInitResult = await tempDs2.initClient();
    expect(reInitResult).toBeDefined();

    // Cleanup
    await tempDs2['pineconeClient'].deleteIndex(tempIndexName);
  });
});
