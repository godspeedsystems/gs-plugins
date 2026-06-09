export class GSStatus {
  constructor(
    public success: boolean,
    public code: number,
    public message?: string,
    public data?: any,
    public headers?: Record<string, string>
  ) {}
}

export class GSDataSource {
  protected config: any;
  protected client: any;

  constructor(config: any) {
    this.config = config;
  }

  protected async initClient(): Promise<object> {
    throw new Error("initClient must be implemented");
  }

  async execute(ctx: any, args: any): Promise<any> {
    throw new Error("execute must be implemented");
  }
}

export const logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

export type PlainObject = Record<string, any>;

export interface GSContext {
  childLogger: any;
  [key: string]: any;
}
