import { GSContext, GSDataSource, PlainObject } from "@godspeedsystems/core";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import {
  S3Config,
  S3ListResponse,
  S3MessageResponse,
  S3OperationArgs,
} from "./types/types";

export default class AWSS3DataSource extends GSDataSource {
  private s3: S3Client;
  private bucketName: string;

  constructor(config: S3Config, bucketName: string) {
    super(config);
    this.s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = bucketName; // Set the bucket name from the argument
  }

  protected async initClient(): Promise<PlainObject> {
    // You can initialize any client-related setup here if needed
    return {};
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const s3Args: S3OperationArgs = args as S3OperationArgs;
    try {
      switch (s3Args.operation) {
        case "list":
          return await this.listObjects();
        case "upload":
          if (!s3Args.Key || !s3Args.Body || !s3Args.ContentType) {
            throw new Error("Missing parameters for upload operation");
          }
          return await this.uploadObject(
            s3Args.Key,
            s3Args.Body,
            s3Args.ContentType
          );
        case "download":
          if (!s3Args.Key) {
            throw new Error("Missing Key parameter for download operation");
          }
          return await this.downloadObject(s3Args.Key);
        case "delete":
          if (!s3Args.Key) {
            throw new Error("Missing Key parameter for delete operation");
          }
          return await this.deleteObject(s3Args.Key);
        default:
          throw new Error("Unsupported S3 operation");
      }
    } catch (error: any) {
      return {
        message: error.toString(),
      };
    }
  }

  private async listObjects(): Promise<S3ListResponse> {
    const command = new ListObjectsV2Command({ Bucket: this.bucketName });
    const response = await this.s3.send(command);
    return {
      Contents: response.Contents || [],
    };
  }

  private async uploadObject(
    Key: string,
    Body: any,
    ContentType: string
  ): Promise<S3MessageResponse> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key,
      Body,
      ContentType,
    });
    await this.s3.send(command);
    return {
      message: "Upload successful",
    };
  }

  private async downloadObject(Key: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key,
    });
    const response = await this.s3.send(command);
    return response.Body;
  }

  private async deleteObject(Key: string): Promise<S3MessageResponse> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key,
    });
    await this.s3.send(command);
    return {
      message: "Object deleted successfully",
    };
  }
}
