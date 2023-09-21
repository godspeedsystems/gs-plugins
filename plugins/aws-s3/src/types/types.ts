export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface S3OperationArgs {
  operation: string;
  Key?: string;
  Body?: any;
  ContentType?: string;
}

export interface S3ListResponse {
  Contents: any[];
}

export interface S3MessageResponse {
  message: string;
}
