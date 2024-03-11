import { GSContext, GSDataSource, GSStatus, PlainObject, logger } from "@godspeedsystems/core";
import { fieldEncryptionMiddleware } from '@godspeedsystems/prisma-deterministic-search-field-encryption';
import { PrismaClient } from "@prisma/client";
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { isPlainObject } from "lodash";

const iv = Buffer.alloc(16);


type AuthzPerms = {
  can_access?: string[]
  no_access?: string[]
  where: PlainObject
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

type PrismaSelect = { [key: string]: boolean };

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
    prisma.models = Prisma.dmmf.datamodel.models;
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
        fnNameInWorkflow,
        authzPerms
      },
      ...rest
    } = args as { meta: { entityType: string, method: string, fnNameInWorkflow: string, authzPerms: AuthzPerms }, rest: PlainObject };
    if (authzPerms) {
      const authzFailRes = modifyForAuthz(this.client, rest, authzPerms, entityType, method);
      if (authzFailRes) {
        return authzFailRes;
      }
    }
    // Now authz checks are set in select fields and passed in where clause
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
      logger.error('Error in executing Prisma query for args %o \n Error: %o', args, error);
      return new GSStatus(false, 400, error.message, JSON.stringify(error.message));
    }
  }
}
function modifyForAuthz(client: typeof PrismaClient, args: PlainObject, authzPerms: AuthzPerms, entityType: string, method: string): GSStatus | undefined {

  // Find the model for this entityType
  const model = client?.models.find((m: any) => m.name === entityType);
  //Find the fields of this model
  const fields = model.fields.map((f: any) => f.name);

  //Fix select fields based on the authzPerms and model fields
  const isSelectFine: GSStatus = fixSelect(args, authzPerms, fields);
  if (!isSelectFine.success) {
    return new GSStatus(true, responseCode(method), undefined, defaultResponse(method));
  }

  if (args.where) {
    //Make sure where clause in the args does not query any fields which are not allowed

    const isWhereFine: GSStatus = assertWhereIsFine(args.where, authzPerms, method);
    if (!isWhereFine.success) {
      isWhereFine.success = true;
      //Just silently return empty response to the user
      return isWhereFine;
    }

    if (authzPerms?.where) {
      // Merge where clause from authzPerms to query's where clause
      // Intentionally doing this after checking args.where first for allowed access,
      // which limits the API caller based on authz rules.
      // But allow authzPerms.where clause to not be limited by authz.can_access/no_access limits
      args.where = Object.assign({}, args?.where, authzPerms?.where);
      if (Object.keys(args.where).length === 0) {
        args.where = undefined;
      }
    }
  } else if (authzPerms?.where) {
    // The args.where is empty. So just assign that to authzPerms.where
    args.where = authzPerms.where;
  }

}
/**
 * Remove any not allowed columns from the select clause 
 * @param query Prisma query args
 * @param authzPerms authz.data.select
 */
function fixSelect(query: PlainObject, authzPerms: AuthzPerms, allFields: string[]): GSStatus {
  let querySelect: string = query.select;
  let finalSelect: string[];
  if (!querySelect) { //Inpout query does not have select clause. Prisma by default returns all fields
    if (authzPerms.can_access) {
      finalSelect = authzPerms.can_access;
    } else if (authzPerms.no_access) {
      finalSelect = allFields.filter((f) => !authzPerms.no_access?.includes(f))
    } else {
      //NO need to set query.select Let it be undefined
      return new GSStatus(true);
    }
  } else {
    if (authzPerms.can_access) {
      const accessFields: string[] = authzPerms.can_access;
      finalSelect = Object.keys(query.select).filter((f: string) => query.select[f] && accessFields.includes(f));
    } else if (authzPerms.no_access) {
      const noAccessFields: string[] = authzPerms.no_access;
      finalSelect = Object.keys(query.select).filter((f: string) => query.select[f] && !noAccessFields.includes(f));
    } else {
      //No need to touch query.select. Let it be as it is
      return new GSStatus(true);
    }
  }
  // Atleast one of can_access or no_access exists
  //@ts-ignore
  if (finalSelect?.length) {
    query.select = finalSelect.reduce((acc: PlainObject, f) => {
      acc[f] = true;
      return acc;
    }, {});
  } else if (query.select) {
    return new GSStatus(false);
  }
  return new GSStatus(true);
}
function assertWhereIsFine(queryWhere: PlainObject | any[], authzPerms: AuthzPerms, method: string): GSStatus {
  //Handle for Array
  if (Array.isArray(queryWhere)) {
    for (let o of queryWhere) {
      const res: GSStatus = assertWhereIsFine(o, authzPerms, method);
      if (!res.success) {
        return res;
      }
    }
    // If all clauses are fine. Just return from this function with success.
    return { success: true };
  }

  //Handle for object
  for (let key of Object.keys(queryWhere)) {
    if (key === 'OR' || key === 'AND') {
      // Go inside nested queries and check
      const res: GSStatus = assertWhereIsFine(queryWhere[key], authzPerms, method);
      if (!res.success) {
        return res;
      }
    } else if (!isFieldAllowed(key, authzPerms)) {
      logger.warn('Tried to access not allowed column in where clause. Not executing query and silently returning empty response. Field %s. Where clause: %o', key, queryWhere)
      return new GSStatus(false, responseCode(method), undefined, defaultResponse(method));
    }
  }
  return { success: true };
}

function isFieldAllowed(key: string, authzPerms: PlainObject) {
  if (authzPerms?.can_access) {
    return authzPerms.can_access.includes(key);
  } else if (authzPerms?.no_access) {
    return !authzPerms.no_access.includes(key);
  } else { // Since no authz perms are there, the field is allowed
    return true;
  }
}
function responseCode(method: string): number {
  return response_codes[method] || 200;
}
function defaultResponse(method: string) {
  return method === 'findMany' ? [] : {};
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