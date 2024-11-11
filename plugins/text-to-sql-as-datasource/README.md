### plugin

# Text-to-SQL DataSource Plugin Documentation

## Overview

A Godspeed plugin that enables natural language to SQL conversion and multi-database query execution with built-in caching support. This plugin leverages Gemini models to convert natural language queries into SQL statements and executes them across various database types.

## Features

- Natural language to SQL conversion using Google Gemini
- Multi-database support
  - PostgreSQL
  - MySQL
  - MongoDB
  - Oracle
- Automatic query caching with Redis
- Query validation
- Schema management
- Error handling and logging
- Connection pooling
- Resource cleanup

## Installation

### Prerequisites

```bash
# Required dependencies
npm install @godspeedsystems/core @google/generative-ai @types/pg mysql2 mongodb @types/oracledb redis
```
## Configuration

### Environment Setup
Create or update your `.env` file with the following:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# PostgreSQL Configuration
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DB=your_database
PG_PASSWORD=your_password
PG_PORT=5432

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_password
MYSQL_DB=your_database

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=your_database

# Oracle Configuration
ORACLE_USER=your_oracle_user
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

### DataSource Configuration
Create a YAML configuration file `src/datasources/text-to-sql.yaml`:

```yaml
type: text-to-sql
config:
  gemini:
    apiKey: ${GEMINI_API_KEY}
  databases:
    postgres:
      enabled: true
      config:
        user: ${PG_USER}
        host: ${PG_HOST}
        database: ${PG_DB}
        password: ${PG_PASSWORD}
        port: ${PG_PORT}
    mysql:
      enabled: true
      config:
        host: ${MYSQL_HOST}
        user: ${MYSQL_USER}
        password: ${MYSQL_PASSWORD}
        database: ${MYSQL_DB}
    mongodb:
      enabled: true
      config:
        url: ${MONGODB_URL}
        database: ${MONGODB_DB}
    oracle:
      enabled: true
      config:
        user: ${ORACLE_USER}
        password: ${ORACLE_PASSWORD}
        connectString: ${ORACLE_CONNECT_STRING}
  cache:
    enabled: true
    ttl: 3600
```
# Example Configuration Guide for Text-to-SQL Plugin



## Plugin Configuration

### 1. DataSource Configuration
Create `src/datasources/text-to-sql.yaml`:
```yaml
type: text-to-sql
config:
  gemini:
    apiKey: ${GEMINI_API_KEY}
  databases:
    postgres:
      enabled: true
      config:
        user: ${PG_USER}
        host: ${PG_HOST}
        database: ${PG_DB}
        password: ${PG_PASSWORD}
        port: ${PG_PORT}
  cache:
    enabled: true
    url: ${REDIS_URL}
```

### 2. Event Configuration
Create `src/events/sql-query.yaml`:
```yaml
http.post./sql-query:
  summary: "Convert natural language to SQL and execute"
  description: "Endpoint to convert natural language to SQL query and execute it"
  fn: execute-query
  authn: false
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            query:
              type: string
              description: "Natural language query to be converted to SQL"
            dbType:
              type: string
              description: "Target database type (postgres, mysql, etc.)"
              default: "postgres"
          required:
            - query
  responses:
    200:
      description: "Successful query execution"
      content:
        application/json:
          schema:
            type: object
```

### 3. Function Configuration
Create `src/functions/execute-query.yaml`:
```yaml
id: execute-query
summary: Execute natural language query
tasks:
  - id: convert-and-execute
    fn: text-to-sql
    args:
      query: <% inputs.body.query %>
      dbType: <% inputs.body.dbType || 'postgres' %>
```

### 4. Handler Implementation
Create `src/functions/execute-query.ts`:
```typescript
import { GSContext, PlainObject } from "@godspeedsystems/core";

async function handler(ctx: GSContext): Promise<PlainObject> {
  try {
    const { body } = ctx.inputs.data;
    
    if (!body.query) {
      throw new Error("Query is required");
    }

    // Execute the query using the text-to-sql datasource
    const result = await ctx.datasources['text-to-sql'].execute(ctx, {
      query: body.query,
      dbType: body.dbType || 'postgres',
      validateOnly: false,
      cache: true
    });

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    ctx.logger.error('Query execution failed:', error);
    return {
      success: false,
      code: 500,
      message: error.message,
      data: {
        message: "Query execution failed"
      }
    };
  }
}

export default handler;
```

### 5. Plugin Code 
Create `src/datasources/types/text-to-sql.ts` and copy the code in index.ts:
```
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
  
    ...
  
    ...
  
  export {
    MultiDBTextToSQLDataSource as DataSource,
    SourceType,
    Type,
    CONFIG_FILE_NAME,
    DEFAULT_CONFIG,
  };
  
```

## Database Setup

### PostgreSQL Container Setup
```bash
# Run PostgreSQL container
sudo docker run --name test-postgres \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=testdb \
  -p 5434:5432 \
  -d postgres:latest

# Create test data
psql -h localhost -p 5434 -U testuser -d testdb

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20)
);

INSERT INTO users (name, email, status) VALUES 
    ('John Doe', 'john@example.com', 'active'),
    ('Jane Smith', 'jane@example.com', 'inactive');
```

### Redis Cache Setup
```bash
# Run Redis container
sudo docker run --name test-redis \
  -p 6380:6379 \
  -d redis:latest
```



## 🎯 Usage

### API Endpoint
POST `/sql-query`

### Request Body
```json
{
  "query": "find all active users",
  "dbType": "postgres"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active"
      }
    ],
    "metadata": {
      "rowCount": 1,
      "executionTime": "0.123s"
    }
  }
}
```

## 🌟 Key Benefits

1. **Developer Productivity**
   - No need to write SQL queries manually
   - Rapid prototyping and development
   - Focus on business logic instead of query syntax

2. **End User Experience**
   - Natural language interface to databases
   - Faster query results with caching
   - Reduced learning curve

3. **Enterprise Ready**
   - Production-grade security
   - Scalable architecture
   - Comprehensive logging
   - Performance optimization

## 🔥 Advanced Examples

### Complex Queries
```json
{
  "query": "Show me total sales by category for active products in last quarter",
  "dbType": "postgres"
}
```

### Analytical Queries
```json
{
  "query": "Calculate monthly growth rate of user signups",
  "dbType": "postgres"
}
```

## 🛡️ Security Features

- Query validation before execution
- SQL injection prevention
- Rate limiting support
- Error handling and sanitization
- Secure database connections

## 📈 Performance

- Redis caching reduces database load
- Query optimization suggestions
- Connection pooling
- Execution time monitoring
- Cache hit ratio tracking


## 📋 TODO & Roadmap

- [ ] Add support for MySQL
- [ ] Implement query optimization suggestions
- [ ] Add GraphQL support
- [ ] Enhanced error messages
- [ ] Query templating system
- [ ] Performance monitoring dashboard


## Example Usage

### Basic Query Event Configuration
Create a new file `src/events/query.yaml`:

```yaml
'http.post./query':
  fn: execute-query
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            query:
              type: string
            dbType:
              type: string
              default: postgres
          required: ['query']
```

### Query Execution Workflow
Define your function `src/functions/execute-query.yaml`:

```yaml
id: execute-query
summary: Execute natural language query
tasks:
  - id: convert-and-execute
    fn: datasource.text-to-sql.execute
    args:
      query: <% inputs.body.query %>
      dbType: <% inputs.body.dbType || 'postgres' %>
```

### Example Requests

1. **Simple Query Request:**
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Find all active users"}'
```

2. **Complex Query Request:**
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show total sales by category for the last quarter",
    "dbType": "mysql"
  }'
```

### Example Responses

```json
{
  "sql": "SELECT category, SUM(amount) AS total_sales FROM sales WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)",
  "data": [
    {
      "category": "Electronics",
      "total_sales": 105000
    }
  ],
  "metadata": {
    "rowCount": 1,
    "executionTime": 48
  }
}
```

## Error Handling

```json
{
  "error": "QUERY_ERROR",
  "message": "Failed to execute query",
  "details": "Syntax error at or near 'total'"
}
```


```

## Limitations

1. Natural language processing depends on Google Gemini
2. Redis required for caching functionality
3. Database-specific features may vary

## Troubleshooting

### Common Issues

1. Connection Failures

   - Verify database credentials
   - Check network connectivity
   - Ensure services are running

2. Query Generation Issues

   - Validate Google gemini API key
   - Check query format
   - Review database schema

3. Cache Problems
   - Verify Redis connection
   - Check cache configuration
   - Monitor memory usage
  







