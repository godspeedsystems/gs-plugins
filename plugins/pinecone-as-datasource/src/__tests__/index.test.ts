import DataSource from "../index";
import { GSStatus } from "./__mocks__/core";
import {
  DataSource as ExportedDataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
} from "../index";

jest.mock("@pinecone-database/pinecone", () => ({
  Pinecone: jest.fn(),
}));

// Helper function to create a properly mocked GSContext
function createMockContext() {
  return {
    childLogger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      child: jest.fn(),
      level: "info",
    },
  } as any;
}

describe("Pinecone DataSource Plugin", () => {
  let dataSource: DataSource;
  let mockClient: any;
  let mockIndex: any;
  const mockConfig = {
    api_key: "test-api-key",
    index_name: "test-index",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIndex = {
      upsert: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      deleteAll: jest.fn(),
    };
    mockClient = {
      index: jest.fn(() => mockIndex),
      deleteIndex: jest.fn(),
    };
    dataSource = new DataSource(mockConfig);
    dataSource.client = mockClient;
  });

  describe("Module Exports", () => {
    test("Should export DataSource class as default", () => {
      expect(ExportedDataSource).toBeDefined();
      expect(new ExportedDataSource(mockConfig)).toBeInstanceOf(DataSource);
    });

    test("Should export SourceType as 'DS'", () => {
      expect(SourceType).toBe("DS");
    });

    test("Should export Type as 'pinecone'", () => {
      expect(Type).toBe("pinecone");
    });

    test("Should export CONFIG_FILE_NAME as 'pinecone'", () => {
      expect(CONFIG_FILE_NAME).toBe("pinecone");
    });

    test("Should export DEFAULT_CONFIG as empty object", () => {
      expect(DEFAULT_CONFIG).toEqual({});
    });
  });

  describe("initClient", () => {
    test("Should throw error if api_key is missing", async () => {
      const configWithoutKey = { index_name: "test-index" };
      const ds = new DataSource(configWithoutKey);
      await expect(ds["initClient"]()).rejects.toThrow(
        "Pinecone API key is required"
      );
    });

    test("Should throw error if index_name is missing", async () => {
      const configWithoutIndex = { api_key: "test-key" };
      const ds = new DataSource(configWithoutIndex);
      await expect(ds["initClient"]()).rejects.toThrow(
        "Pinecone index name is required"
      );
    });

    test("Should initialize client with valid config", async () => {
      const ds = new DataSource(mockConfig);
      const client = await ds["initClient"]();
      expect(client).toBeDefined();
    });

    test("Should call Pinecone constructor with correct api_key", async () => {
      const { Pinecone } = require("@pinecone-database/pinecone");
      const ds = new DataSource(mockConfig);
      await ds["initClient"]();
      expect(Pinecone).toHaveBeenCalledWith({
        apiKey: "test-api-key",
      });
    });
  });

  describe("execute - insert operation", () => {
    test("Should insert vectors successfully", async () => {
      const vectors = [
        { id: "1", values: [0.1, 0.2, 0.3] },
        { id: "2", values: [0.4, 0.5, 0.6] },
      ];
      mockIndex.upsert.mockResolvedValue({ upsertedCount: 2 });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
          vectors,
        }
      );

      expect(result).toBeInstanceOf(GSStatus);
      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should return error if vectors is missing", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should return error if vectors is not an array", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
          vectors: "not-an-array",
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should handle insert error from Pinecone", async () => {
      mockIndex.upsert.mockRejectedValue(new Error("Pinecone error"));

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
          vectors: [{ id: "1", values: [0.1, 0.2] }],
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe("execute - query operation", () => {
    test("Should query vectors successfully", async () => {
      mockIndex.query.mockResolvedValue({
        matches: [{ id: "1", score: 0.9 }],
      });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: [0.1, 0.2, 0.3],
          top_k: 10,
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should query with filter successfully", async () => {
      mockIndex.query.mockResolvedValue({
        matches: [{ id: "1", score: 0.9 }],
      });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: [0.1, 0.2, 0.3],
          filter: { status: "active" },
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should return error if vector is missing", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should return error if vector is not an array", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: "not-an-array",
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should use default top_k value", async () => {
      mockIndex.query.mockResolvedValue({ matches: [] });

      await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: [0.1, 0.2, 0.3],
        }
      );

      expect(mockIndex.query).toHaveBeenCalledWith(
        expect.objectContaining({
          topK: 10,
        })
      );
    });

    test("Should handle query error from Pinecone", async () => {
      mockIndex.query.mockRejectedValue(new Error("Query error"));

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: [0.1, 0.2, 0.3],
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe("execute - update operation", () => {
    test("Should update vector successfully", async () => {
      mockIndex.update.mockResolvedValue({ id: "1" });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.update" },
          id: "1",
          values: [0.1, 0.2, 0.3],
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should update vector with metadata", async () => {
      mockIndex.update.mockResolvedValue({ id: "1" });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.update" },
          id: "1",
          values: [0.1, 0.2, 0.3],
          metadata: { key: "value" },
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should return error if id is missing", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.update" },
          values: [0.1, 0.2, 0.3],
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should handle update error from Pinecone", async () => {
      mockIndex.update.mockRejectedValue(new Error("Update error"));

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.update" },
          id: "1",
          values: [0.1, 0.2, 0.3],
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe("execute - delete operation", () => {
    test("Should delete vectors by ids", async () => {
      mockIndex.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.delete" },
          ids: ["1", "2"],
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should delete all vectors with deleteAll flag", async () => {
      mockIndex.deleteAll.mockResolvedValue({ deletedCount: 100 });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.delete" },
          deleteAll: true,
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should delete vectors by filter", async () => {
      mockIndex.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.delete" },
          filter: { status: "inactive" },
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should return error if no delete parameters provided", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.delete" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should handle delete error from Pinecone", async () => {
      mockIndex.deleteMany.mockRejectedValue(new Error("Delete error"));

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.delete" },
          ids: ["1"],
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe("execute - deleteIndex operation", () => {
    test("Should delete index successfully", async () => {
      mockClient.deleteIndex.mockResolvedValue({ status: "ok" });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.deleteIndex" },
        }
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
    });

    test("Should handle deleteIndex error", async () => {
      mockClient.deleteIndex.mockRejectedValue(
        new Error("Index deletion failed")
      );

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.deleteIndex" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe("execute - unknown operation", () => {
    test("Should return error for unknown operation", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.unknown" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  describe("execute - general error handling", () => {
    test("Should return error if fnNameInWorkflow is missing", async () => {
      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: {},
        }
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test("Should pass vector values through to Pinecone client", async () => {
      mockIndex.query.mockResolvedValue({ matches: [] });

      await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.query" },
          vector: [0.1, 0.2, 0.3],
          top_k: 20,
        }
      );

      expect(mockIndex.query).toHaveBeenCalledWith(
        expect.objectContaining({
          vector: [0.1, 0.2, 0.3],
          topK: 20,
        })
      );
    });

    test("Should handle sparse values in update operation", async () => {
      mockIndex.update.mockResolvedValue({ id: "1" });

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.update" },
          id: "1",
          sparseValues: { indices: [0, 2], values: [0.5, 0.7] },
        }
      );

      expect(result.success).toBe(true);
      expect(mockIndex.update).toHaveBeenCalledWith(
        expect.objectContaining({
          sparseValues: { indices: [0, 2], values: [0.5, 0.7] },
        })
      );
    });

    test("Should call index method with correct index name on insert", async () => {
      mockIndex.upsert.mockResolvedValue({ upsertedCount: 1 });

      await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
          vectors: [{ id: "1", values: [0.1] }],
        }
      );

      expect(mockClient.index).toHaveBeenCalledWith("test-index");
    });

    test("Should return data in GSStatus response for successful operations", async () => {
      const mockData = { upsertedCount: 2 };
      mockIndex.upsert.mockResolvedValue(mockData);

      const result = await dataSource.execute(
        createMockContext(),
        {
          meta: { fnNameInWorkflow: "datasource.pinecone.insert" },
          vectors: [{ id: "1", values: [0.1] }],
        }
      );

      expect(result.data).toEqual(mockData);
    });
  });
});
