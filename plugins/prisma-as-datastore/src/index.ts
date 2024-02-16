import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";
import { fieldEncryptionMiddleware } from '@mindgrep/prisma-deterministic-search-field-encryption';
import { Buffer } from 'buffer';
import crypto from 'crypto';

const iv = Buffer.alloc(16);

function responseCode(method: string): number {
  return response_codes[method] || 200;
}

const response_codes: { [key: string]: number } = {
  find: 200,
  findFirst: 200,
  findUnique: 200,
  findMany: 200,
  create: 201,
  createMany: 201,
  update: 204,
  updateMany: 204,
  upsert: 201,
  delete: 202,
  deleteMany: 202,
  count: 200,
  aggregate: 200,
  groupBy: 200,
};

class DataSource extends GSDataSource {

	secret = this.config.prisma_secret || 'prismaEncryptionSecret';

	password_hash = crypto
		.createHash('md5')
		.update(this.secret, 'utf-8')
		.digest('hex')
		.toUpperCase();

  protected async initClient(): Promise<object> {
    try {
      // TODO: until we figure out, how to share path between prisma file and our module loader
      // we are supporting only one prisma db

      // const module = await import(`../../../node_modules/.prisma/${this.config.name}`);
      // const prisma = new module.PrismaClient();

			const client = await this.loadPrismaClient();
			return client;
		} catch (error) {
      console.error('Could not load prisma client', this.config.name);
      console.error(error);
			process.exit(1);
		}
	}

	async loadPrismaClient(): Promise<PlainObject> {
		const pathString: string = `${process.cwd()}/dist/datasources/prisma-clients/${this.config.name}`;
		// console.log(this.config.name, pathString)
		const { Prisma, PrismaClient } = require(pathString);
		const prisma = new PrismaClient();
		await prisma.$connect();
		prisma.$use(
			fieldEncryptionMiddleware({
				encryptFn: (decrypted: any) => this.cipher(decrypted),
				decryptFn: (encrypted: string) => this.decipher(encrypted),
				dmmf: Prisma.dmmf,
			})
		);
		return prisma;
	}

	cipher(decrypted: any) {
		const cipher = crypto.createCipheriv('aes-256-gcm', this.password_hash, iv);
		return cipher.update(decrypted, 'utf-8', 'hex');
	}
	
	decipher(encrypted: string) {
		const decipher = crypto.createDecipheriv('aes-256-gcm', this.password_hash, iv);
		return decipher.update(encrypted, 'hex', 'utf-8');
	}

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    const { logger } = ctx;
    const {
      meta: {
        entityType,
        method,
        fnNameInWorkflow
      },
      ...rest
    } = args as { meta: { entityType: string, method: string, fnNameInWorkflow: string }, rest: PlainObject };

    let prismaMethod: any;
    try {
      if (this.client) {
        const client = this.client;

        // @ts-ignore
        if (entityType && !client[entityType]) {
          return new GSStatus(false, 400, undefined, `Invalid entityType '${entityType}' in ${fnNameInWorkflow}.`);
        }

        // @ts-ignore
        prismaMethod = client[entityType][method];

        if (method && !prismaMethod) {
          return new GSStatus(false, 500, undefined, `Invalid CRUD method '${method}' in ${fnNameInWorkflow}`);
        }
        // @ts-ignore
        const prismaResponse = await prismaMethod.bind(client)(rest);

        return new GSStatus(true, responseCode(method), undefined, prismaResponse);
      }
    } catch (error: any) {
      logger.error(error);
      return new GSStatus(false, 400, error.message, JSON.stringify(error.message));
    }
  }
}

const SourceType = 'DS';
const Type = 'prisma'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'prisma'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}