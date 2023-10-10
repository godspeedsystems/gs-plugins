# godspeed-plugin-prisma-as-datasource

Welcome to the Godspeed Prisma Plugin! 🚀

**"Prisma: Bridging Databases for Seamless Development. One Toolkit, Any Database."**

Prisma is a modern and open-source database toolkit that simplifies database access for developers. It offers a strongly typed query builder, schema migrations, support for various databases, real-time data synchronization, and enhanced security, making it a powerful tool for efficient and secure database interactions in web applications.


## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-prisma-as-datastore` to integrate the plugin.

```bash
godspeed plugin add

~~~~~~ Godspeed CLI ~~~~~~

? Please select godspeed plugin to install. 
  @godspeedsystems/plugins-cron-as-eventsource 
❯ @godspeedsystems/plugins-prisma-as-datastore
  @godspeedsystems/plugins-express-as-http 
  @godspeedsystems/plugins-axios-as-datasource 
  @godspeedsystems/plugins-aws-as-datasource 
  @godspeedsystems/plugins-mailer-as-datasource 
  @godspeedsystems/plugins-excel-as-datasource 
(Move up and down to reveal more choices)
```
- You will find the a file in your project related to the Prisma plugin at `src/datasources/types/prisma.ts` 


### prisma.ts

```typescript
import { DataSource } from '@godspeedsystems/plugins-prisma-as-datastore';
export default DataSource;
```

Now create a Prisma file with your required database in <**database_name.prisma**> check below sample mongo.prisma file

## Databases supported by Prisma 
Prisma supports a variety of data sources, allowing you to connect to and work with different database systems. As of my last knowledge update in September 2021, Prisma supports the following data sources:

1. **PostgreSQL**: Prisma has strong support for PostgreSQL, one of the most popular open-source relational database systems.

2. **MySQL**: Prisma can be used with MySQL, another widely used open-source relational database management system.

3. **SQLite**: SQLite is a serverless, self-contained, and zero-configuration database engine, and Prisma supports it as well.

4. **SQL Server**: Prisma offers support for Microsoft SQL Server, a popular commercial relational database management system.

5. **MongoDB (Experimental)**: Prisma also has experimental support for MongoDB, a NoSQL database, although this support may not be as mature as for relational databases.

6. **CockroachDB**: A distributed, resilient SQL database for large-scale, cloud-native applications.

7. **MariaDB**: An open-source, high-performance relational database system and MySQL-compatible alternative.

8. **PlanetScale**: PlanetScale is a database-as-a-service platform designed for distributed SQL databases. It provides a managed, scalable, and highly available database solution for modern, cloud-native applications.

### Example prisma file using mongo database

#### mongo.prisma
```prisma
datasource db {
  provider = "mongodb"
  url      = env("MONGO_TEST_URL") //Connection string can be found in the .env folder. you can add your own database connection string
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
}

model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)
  title     String
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  String   @db.ObjectId
}

enum Role {
  USER
  ADMIN
}
```

**Create a prisma schema according to your selected database and save it,the above schema is created for mongo database**

To learn more about prisma schema and it databases [Checkout prisma](https://www.prisma.io/docs)


Open terminal in vscode and enter the below command
```bash
godspeed prisma prepare
```

**This command will generate the prisma client and will sync the database with prisma schema**

Now to generate the CRUD API'S enter the below command
```bash
godspeed gen-crud-api
```
* This command will generate the crud apis based on the sample prisma schema provided at ./src/datasources/mongo.prisma

* Now you can view the event and workflows according defined prisma schema

#### sample event for get api
```yaml
http.get./mongo/post/{id}:
  summary: Fetch Post
  description: Fetch Post from database
  fn: com.biz.mongo.post.one
  params:
    - name: id
      in: path
      required: true
      schema:
        type: string
  responses:
    content:
      application/json:
        schema:
          type: object
```
#### sample workflow for get api
```yaml
summary: Fetch Post
tasks:
  - id: mongo_post_one
    fn: datasource.mongo.Post.findUnique
    args:
      where:
        id: <% inputs.params.id %>
```

Run godspeed dev to start the development server.
```bash
godspeed dev
```


