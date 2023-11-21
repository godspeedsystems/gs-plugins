# godspeed-plugin-elasticgraph-as-datasource

Welcome to the Godspeed Elasticgraph Plugin! 🚀

**"Elasticgraph: Relationship aware node.js ORM over elasticsearch, with agility, quality and joy of development."**

**EG saves LOT of effort in development** of a typical product because it _abstracts some most common data operations into a simple configurable abstractions_ saving hundreds to thousand lines of code, makes the code neat, elegantly abstracts business logic in configurable text files and saves many hours of development and testing.

Using ElasticGraph one can configure and run (out of the box) highly scalable microservices using _relational graph approach, optimized for storing and querying large informational graphs in greater depth and complexity._

The node module internally uses **intelligent query batching and in memory caching**, to support thousands of concurrent users, and complex search and analytic graph queries.

## How to Use

- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-elasticgraph-as-datastore` to integrate the plugin.

```bash
$ godspeed plugin add


       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝


? Please select godspeed plugin to install: (Press <space> to select, <Up and Down> to move rows)
┌──────┬────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐
│      │ Name                                   │ Description                                                                    │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ mailer-as-datasource                   │ mailer as datasource plugin for Godspeed Framework                             │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ kafka-as-datasource-as-eventsource     │ kafka as datasource-as-eventsource plugin for Godspeed Framework               │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ cron-as-eventsource                    │ Cron as eventsource plugin for Godspeed Framework                              │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ redis-as-datasource                    │ redis as datasource plugin for Godspeed Framework                              │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ ❯◯   │ elasticgraph-as-datasource             │ elasticgraph as datasource plugin for Godspeed Framework                       │
└──────┴────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

- You will find the a file in your project related to the Elasticgraph plugin at `src/datasources/types/elasticgraph.ts`

### elasticgraph.ts

```typescript
import { DataSource } from "@godspeedsystems/plugins-elasticgraph-as-datasource";
export default DataSource;
```

Update configuration file based on your requirements in `datasources/elasticgraph.yaml`.

#### elasticgraph config ( src/datasources/elasticgraph.yaml )

```yaml
type: elasticgraph
deep: false
collect: false
schema_backend: "path to your elasticgraph-model"
```

**Create a elasticgraph model accordingly and save it**

```bash
.
├── elasticgraph.yaml
├── eg1
│   ├── collect.toml
│   ├── common.toml
│   ├── config.toml
│   ├── custom.toml
│   ├── elasticsearch.toml
│   ├── joins
│   │   └── search.txt
│   └── schema
│       ├── aggregation.toml
│       ├── dependencies.toml
│       ├── entities
│       │   ├── reconciled.toml
│       │   └── auth_user.toml
│       ├── entitiesInfo.toml
│       ├── relationships.txt
│       ├── suggestions.toml
│       └── union.toml
```

Now to generate the CRUD API'S enter the below command

```bash
godspeed gen-crud-api
```

```bash
       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝



> eg-plugin-test-project@1.0.0 gen-crud-api
> npx @godspeedsystems/api-generator

Select datasource / schema to generate CRUD APIs
(x) elasticgraph.yaml
( ) For all
( ) Cancel
```

- This command will generate the crud apis based on the sample elasticgraph model(schema_backend) provided at ./src/datasources/elasticgraph.yaml

- Now you can view the event and workflows according defined elasticgraph model

#### sample event for create api

```yaml
http.post./elasticgraph/category:
  summary: Create a new category
  description: Create category from elasticgraph
  fn: com.eg.elasticgraph.category.create
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            data:
              type: object
              properties:
                id:
                  type: number
                name:
                  type: string
  responses:
    content:
      application/json:
        schema:
          type: object
```

#### sample workflow for create api

```yaml
summary: Create category
tasks:
  - id: elasticgraph_category_create
    fn: datasource.elasticgraph.category.index
    args:
      data:
        index: categorys
        type: _doc
        id: <% inputs.body.id %>
        body: <% inputs.body.data %>
    on_error:
      continue: false
```

Run godspeed dev to start the development server.

```bash
godspeed dev
```
