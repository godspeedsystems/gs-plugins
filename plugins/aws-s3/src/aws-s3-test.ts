import AWSS3DataSource from "./index"; // Update the path to your AWSS3DataSource implementation
import { GSContext, PlainObject } from "@godspeedsystems/core";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import { promises as fsPromises } from "fs";

describe("AWSS3DataSource Integration Tests", () => {
  let dataSource: AWSS3DataSource;
  let testFiles: string[] = []; // Define the type as string[] for testFiles

  beforeAll(async () => {
    // Mock the S3Client for testing purposes.
    const mockS3Client = new S3Client({
      region: "mock-region",
      credentials: {
        accessKeyId: "mock-access-key",
        secretAccessKey: "mock-secret-key",
      },
    });

    // Set up the data source with your mock context and AWS S3 client.
    const config = {
      region: "mock-region",
      accessKeyId: "mock-access-key",
      secretAccessKey: "mock-secret-key",
    };

    dataSource = new AWSS3DataSource(config, "give-your-bucket-name-here");

    // Create test files with unique names.
    for (let i = 0; i < 3; i++) {
      const testFileName = `testfile-${randomBytes(8).toString("hex")}.txt`;
      await fsPromises.writeFile(testFileName, "Test content");
      testFiles.push(testFileName);
    }
  });

  afterAll(async () => {
    // Clean up test files.
    for (const testFile of testFiles) {
      await fsPromises.unlink(testFile);
    }
  });

  it("should list objects in the bucket", async () => {
    const result = await dataSource.execute(
      {} as GSContext,
      { operation: "list" } as PlainObject
    );

    // Assert the result as needed for your specific implementation.
    expect(Array.isArray(result.Contents)).toBe(true);
  });

  it("should upload an object to the bucket", async () => {
    const testFileName = testFiles[0];
    const uploadArgs = {
      operation: "upload",
      Key: testFileName,
      Body: await fsPromises.readFile(testFileName, "utf8"),
      ContentType: "text/plain",
    };

    const result = await dataSource.execute(
      {} as GSContext,
      uploadArgs as PlainObject
    );

    // Assert the result as needed for your specific implementation.
    expect(result.message).toBe("Upload successful");
  });

  it("should download an object from the bucket", async () => {
    const testFileName = testFiles[1];
    const downloadArgs = {
      operation: "download",
      Key: testFileName,
    };

    const result = await dataSource.execute(
      {} as GSContext,
      downloadArgs as PlainObject
    );

    // Assert the result as needed for your specific implementation.
    expect(result).toEqual("Test content");
  });

  it("should delete an object from the bucket", async () => {
    const testFileName = testFiles[2];
    const deleteArgs = {
      operation: "delete",
      Key: testFileName,
    };

    const result = await dataSource.execute(
      {} as GSContext,
      deleteArgs as PlainObject
    );

    // Assert the result as needed for your specific implementation.
    expect(result.message).toBe("Object deleted successfully");
  });

  // Add more test cases as needed.
});
