import {
    GSContext,
    GSDataSource,
    PlainObject,
    logger,
  } from '@godspeedsystems/core';
  import { Pool as PgPool } from 'pg';
  import {
    Connection as MySQLConnection,
    createConnection as createMySQLConnection,
  } from 'mysql2/promise';
  import { MongoClient, Db } from 'mongodb';
  import * as oracledb from 'oracledb';
  import { createClient, RedisClientType } from 'redis';
  import { createHash } from 'crypto';
  import { GoogleGenerativeAI } from '@google/generative-ai';
  
  // Interfaces
  interface DatabaseConfig {
    type: 'postgres' | 'mysql' | 'mongodb' | 'oracle';
    config: any;
  }
  
  interface DatabaseConnection {
    client: any;
    type: string;
    isConnected: boolean;
  }
  
  interface QueryResult {
    data: any[];
    metadata?: any;
  }
  
  class DatabaseConnectionManager {
    private connections: Map<string, DatabaseConnection> = new Map();
  
    async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
      try {
        switch (config.type) {
          case 'postgres':
            return await this.connectPostgres(config.config);
          case 'mysql':
            return await this.connectMySQL(config.config);
          case 'mongodb':
            return await this.connectMongo(config.config);
          case 'oracle':
            return await this.connectOracle(config.config);
          default:
            throw new Error(`Database not supported yet: ${config.type}`);
        }
      } catch (error) {
        logger.error(`Database connection failed for ${config.type}:`, error);
        throw error;
      }
    }
  
    private async connectPostgres(config: any): Promise<DatabaseConnection> {
      try {
        const pool = new PgPool(config);
        await pool.query('SELECT 1');
        logger.info('PostgreSQL connection established');
        return { client: pool, type: 'postgres', isConnected: true };
      } catch (error) {
        logger.error('PostgreSQL connection failed:', error);
        throw error;
      }
    }
  
    private async connectMySQL(config: any): Promise<DatabaseConnection> {
      try {
        const connection = await createMySQLConnection(config);
        await connection.query('SELECT 1');
        logger.info('MySQL connection established');
        return { client: connection, type: 'mysql', isConnected: true };
      } catch (error) {
        logger.error('MySQL connection failed:', error);
        throw error;
      }
    }
  
    private async connectMongo(config: any): Promise<DatabaseConnection> {
      try {
        const client = await MongoClient.connect(config.url);
        const db = client.db(config.database);
        logger.info('MongoDB connection established');
        return { client: db, type: 'mongodb', isConnected: true };
      } catch (error) {
        logger.error('MongoDB connection failed:', error);
        throw error;
      }
    }
  
    private async connectOracle(config: any): Promise<DatabaseConnection> {
      try {
        const connection = await oracledb.getConnection({
          user: config.user,
          password: config.password,
          connectString: config.connectString,
        });
        await connection.execute('SELECT 1 FROM DUAL');
        logger.info('Oracle connection established');
        return { client: connection, type: 'oracle', isConnected: true };
      } catch (error) {
        logger.error('Oracle connection failed:', error);
        throw error;
      }
    }
  }
  
  export default class MultiDBTextToSQLDataSource extends GSDataSource {
    private genAI!: GoogleGenerativeAI;
    private model!: any;
    private dbManager!: DatabaseConnectionManager;
    private connections!: Map<string, DatabaseConnection>;
    private redisClient!: RedisClientType;
    private schemas!: Map<string, string>;
  
    protected async initClient(): Promise<object> {
      try {
        logger.info('Initializing Text-to-SQL service');
  
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  
        this.dbManager = new DatabaseConnectionManager();
        this.connections = new Map();
        this.schemas = new Map();
  
        await this.initializeDatabases();
  
        this.redisClient = createClient({
          url: process.env.REDIS_URL,
        });
  
        logger.info('Text-to-SQL service initialized successfully');
        return { status: 'initialized' };
      } catch (error) {
        logger.error('Service initialization failed:', error);
        throw error;
      }
    }
  
    private async initializeDatabases() {
      const dbConfigs: DatabaseConfig[] = [
        {
          type: 'postgres',
          config: {
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DB,
            password: process.env.PG_PASSWORD,
            port: parseInt(process.env.PG_PORT || '5432'),
          },
        },
        {
          type: 'mysql',
          config: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
          },
        },
        {
          type: 'mongodb',
          config: {
            url: process.env.MONGODB_URL,
            database: process.env.MONGODB_DB,
          },
        },
        {
          type: 'oracle',
          config: {
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING,
          },
        },
      ];
  
      for (const config of dbConfigs) {
        try {
          logger.info(`Initializing ${config.type} connection`);
          const connection = await this.dbManager.connect(config);
          this.connections.set(config.type, connection);
          this.schemas.set(
            config.type,
            await this.fetchDatabaseSchema(config.type),
          );
          logger.info(`${config.type} initialization complete`);
        } catch (error) {
          logger.error(`Failed to initialize ${config.type}:`, error);
        }
      }
    }
  
    private async fetchDatabaseSchema(dbType: string): Promise<string> {
      const connection = this.connections.get(dbType);
      if (!connection) throw new Error(`No connection found for ${dbType}`);
  
      try {
        logger.info(`Fetching schema for ${dbType}`);
        switch (dbType) {
          case 'postgres':
            return await this.fetchPostgresSchema(connection);
          case 'mysql':
            return await this.fetchMySQLSchema(connection);
          case 'mongodb':
            return await this.fetchMongoSchema(connection);
          case 'oracle':
            return await this.fetchOracleSchema(connection);
          default:
            throw new Error(`Unsupported database type: ${dbType}`);
        }
      } catch (error) {
        logger.error(`Schema fetch failed for ${dbType}:`, error);
        throw error;
      }
    }
  
    private async fetchPostgresSchema(
      connection: DatabaseConnection,
    ): Promise<string> {
      const schemaQuery = `
              SELECT 
                  table_name,
                  column_name,
                  data_type,
                  is_nullable
              FROM 
                  information_schema.columns
              WHERE 
                  table_schema = 'public'
              ORDER BY 
                  table_name, ordinal_position;
          `;
      const result = await connection.client.query(schemaQuery);
      return this.formatRelationalSchema(result.rows);
    }
  
    private async fetchMySQLSchema(
      connection: DatabaseConnection,
    ): Promise<string> {
      const [rows] = await connection.client.query(`
              SELECT 
                  TABLE_NAME,
                  COLUMN_NAME,
                  DATA_TYPE,
                  IS_NULLABLE
              FROM 
                  INFORMATION_SCHEMA.COLUMNS
              WHERE 
                  TABLE_SCHEMA = DATABASE()
          `);
      return this.formatRelationalSchema(rows);
    }
  
    private async fetchMongoSchema(
      connection: DatabaseConnection,
    ): Promise<string> {
      const db = connection.client as Db;
      const collections = await db.listCollections().toArray();
      return this.formatMongoSchema(collections);
    }
  
    private async fetchOracleSchema(
      connection: DatabaseConnection,
    ): Promise<string> {
      const result = await connection.client.execute(
        `
              SELECT 
                  table_name,
                  column_name,
                  data_type,
                  nullable,
                  data_length,
                  data_precision
              FROM 
                  user_tab_columns
              ORDER BY 
                  table_name, column_id
          `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
  
      return this.formatOracleSchema(result.rows);
    }
  
    private formatRelationalSchema(rows: any[]): string {
      const tableMap = new Map<string, any[]>();
      rows.forEach((row) => {
        const tableName = row.table_name || row.TABLE_NAME;
        if (!tableMap.has(tableName)) {
          tableMap.set(tableName, []);
        }
        tableMap.get(tableName)?.push(row);
      });
  
      return Array.from(tableMap.entries())
        .map(([table, columns]) => {
          return `Table ${table} {\n${columns
            .map(
              (col) =>
                `  ${col.column_name || col.COLUMN_NAME} ${
                  col.data_type || col.DATA_TYPE
                }`,
            )
            .join('\n')}\n}`;
        })
        .join('\n\n');
    }
  
    private formatMongoSchema(collections: any[]): string {
      return collections
        .map(
          (collection) =>
            `Collection ${collection.name} {\n  // Schema is dynamic\n}`,
        )
        .join('\n\n');
    }
  
    private formatOracleSchema(rows: any[]): string {
      const tableMap = new Map<string, any[]>();
      rows.forEach((row) => {
        if (!tableMap.has(row.TABLE_NAME)) {
          tableMap.set(row.TABLE_NAME, []);
        }
        tableMap.get(row.TABLE_NAME)?.push(row);
      });
  
      return Array.from(tableMap.entries())
        .map(([table, columns]) => {
          return `Table ${table} {\n${columns
            .map(
              (col) =>
                `  ${col.COLUMN_NAME} ${col.DATA_TYPE}(${col.DATA_LENGTH})`,
            )
            .join('\n')}\n}`;
        })
        .join('\n\n');
    }
  
    async execute(ctx: GSContext, args: PlainObject): Promise<any> {
      const {
        query,
        dbType = 'postgres', //defaults to postgres
        validateOnly = false,
        cache = true,
      } = args;
  
      try {
        logger.info('Executing query', { dbType, validateOnly });
  
        const connection = this.connections.get(dbType);
        if (!connection) {
          throw new Error(`No connection available for database type: ${dbType}`);
        }
  
        if (cache) {
          const cachedResult = await this.getCachedQuery(query, dbType);
          if (cachedResult) {
            logger.info('Cache hit, returning cached result');
            return cachedResult;
          }
        }
  
        const generatedQuery = await this.generateQuery(query, dbType);
        logger.debug('Generated SQL query', { generatedQuery });
  
        if (validateOnly) {
          return { status: 'valid', query: generatedQuery };
        }
  
        const result = await this.executeQuery(generatedQuery, dbType);
  
        if (cache) {
          await this.cacheQuery(query, dbType, result);
        }
  
        logger.info('Query executed successfully');
        return result;
      } catch (error) {
        logger.error('Query execution failed:', error);
        throw error;
      }
    }
  
    private async generateQuery(
      naturalQuery: string,
      dbType: string,
    ): Promise<string> {
      const schema = this.schemas.get(dbType);
  
      try {
        const prompt = `
          Schema:
          ${schema}
    
          Task: Convert this natural language query to a PostgreSQL query:
          "${naturalQuery}"
    
          Requirements:
          - Return only the raw SQL query
          - No markdown formatting
          - No explanations
          - Must start with SELECT
          - Only use existing tables and columns
        `;
    
        const result = await this.model.generateContent(prompt);
        let sql = result.response.text().trim();
        
        // Clean up the response
        sql = sql.replace(/```sql/gi, '')
                 .replace(/```/g, '')
                 .replace(/`/g, '')
                 .trim();
    
        // Basic validation
        if (!sql.toLowerCase().startsWith('select')) {
          throw new Error('Generated query must start with SELECT');
        }
    
        return sql;
      } catch (error:any) {
        logger.error(`SQL generation failed: ${error.message}`);
        throw new Error(`Failed to generate SQL: ${error.message}`);
      }
    }
  
    private async executeQuery(
      query: string,
      dbType: string,
    ): Promise<QueryResult> {
      const connection = this.connections.get(dbType);
      if (!connection) throw new Error(`No connection found for ${dbType}`);
  
      try {
        switch (dbType) {
          case 'postgres':
            const pgResult = await connection.client.query(query);
            return {
              data: pgResult.rows,
              metadata: { rowCount: pgResult.rowCount },
            };
  
          case 'mysql':
            const [mysqlRows] = await connection.client.query(query);
            return { data: mysqlRows };
  
          case 'mongodb':
            const mongoResult = await eval(`connection.client.${query}`);
            return {
              data: Array.isArray(mongoResult) ? mongoResult : [mongoResult],
            };
  
          case 'oracle':
            const oracleResult = await connection.client.execute(query, [], {
              outFormat: oracledb.OUT_FORMAT_OBJECT,
            });
            return {
              data: oracleResult.rows || [],
              metadata: {
                rowsAffected: oracleResult.rowsAffected,
                metaData: oracleResult.metaData,
              },
            };
  
          default:
            throw new Error(`Unsupported database type: ${dbType}`);
        }
      } catch (error) {
        logger.error(`Query execution failed for ${dbType}:`, error);
        throw error;
      }
    }
  
    private async cacheQuery(
      query: string,
      dbType: string,
      result: QueryResult,
    ): Promise<void> {
      const hash = createHash('md5').update(query).update(dbType).digest('hex');
  
      try {
        await this.redisClient.set(`sql_cache:${hash}`, JSON.stringify(result), {
          EX: 3600, // Sets expiration to 1 hour
        });
        logger.debug('Query result cached', { hash });
      } catch (error) {
        logger.warn('Cache operation failed:', error);
      }
    }
  
    private async getCachedQuery(
      query: string,
      dbType: string,
    ): Promise<QueryResult | null> {
      const hash = createHash('md5').update(query).update(dbType).digest('hex');
  
      try {
        const cached = await this.redisClient.get(`sql_cache:${hash}`);
        return cached ? JSON.parse(cached) : null;
      } catch (error) {
        logger.warn('Cache retrieval failed:', error);
        return null;
      }
    }
  
    async cleanup(): Promise<void> {
      try {
        logger.info('Starting cleanup');
  
        // Close other database connections
        for (const [dbType, connection] of this.connections.entries()) {
          try {
            switch (connection.type) {
              case 'postgres':
                await (connection.client as PgPool).end();
                break;
              case 'mysql':
                await (connection.client as MySQLConnection).end();
                break;
              case 'oracle':
                await connection.client.close();
                break;
              case 'mongodb':
                await (connection.client as MongoClient).close();
                break;
            }
            logger.info(`Closed ${dbType} connection`);
          } catch (error) {
            logger.error(`Failed to close ${dbType} connection:`, error);
          }
        }
  
        await this.redisClient.quit(); // Ensure Redis client is properly closed
        logger.info('Cleanup completed successfully');
      } catch (error) {
        logger.error('Cleanup failed:', error);
        throw error;
      }
    }
  }
  
  const SourceType = 'DS';
  const Type = 'text-to-sql';
  const CONFIG_FILE_NAME = 'text-to-sql';
  const DEFAULT_CONFIG = {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    databases: {
      postgres: {
        enabled: true,
        config: {
          user: process.env.PG_USER,
          host: process.env.PG_HOST,
          database: process.env.PG_DB,
          password: process.env.PG_PASSWORD,
          port: parseInt(process.env.PG_PORT || '5432'),
        },
      },
      mysql: {
        enabled: true,
        config: {
          host: process.env.MYSQL_HOST,
          user: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DB,
        },
      },
      mongodb: {
        enabled: true,
        config: {
          url: process.env.MONGODB_URL,
          database: process.env.MONGODB_DB,
        },
      },
      oracle: {
        enabled: true,
        config: {
          user: process.env.ORACLE_USER,
          password: process.env.ORACLE_PASSWORD,
          connectString: process.env.ORACLE_CONNECT_STRING,
        },
      },
    },
    redis: {
      url: process.env.REDIS_URL,
    },
  };
  
  export {
    MultiDBTextToSQLDataSource as DataSource,
    SourceType,
    Type,
    CONFIG_FILE_NAME,
    DEFAULT_CONFIG,
  };
  
