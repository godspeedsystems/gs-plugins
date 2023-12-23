# godspeed-plugin-graphql-as-eventsource

Welcome to the [Godspeed](https://www.godspeed.systems/) GraphQL Plugin! 🚀

**Godspeed** leverages Apollo Server, a powerful and extensible open-source server built on GraphQL, to streamline the creation of GraphQL APIs. Apollo Server excels in automatic schema generation and seamless integration with diverse data sources, providing a robust foundation for scalable and high-performance GraphQL applications.

This guide offers a concise overview of integrating the GraphQL plugin into the Godspeed framework as an Event Source.

## Steps to Utilize the GraphQL Plugin in the Godspeed Framework:

### Example Usage:

1. Add the GraphQL plugin to Godspeed-CLI with the `godspeed plugin add` command.

2. Tailor the configuration file according to your needs in `eventsource/graphql.yaml`.

#### GraphQL Configuration (src/eventsources/Apollo.yaml)
```yaml
type: graphql
port: 4000
```

3. Ensure the event key prefix aligns with the name of the configuration YAML file. In this example, the prefix for the Event key is `Apollo`. The event schema follows REST standards, resembling HTTP events.

#### GraphQL Event (src/events/create_category.yaml)
```yaml
Apollo.post./mongo/category:
  summary: Create a new Category
  description: Create Category from the database
  fn: create
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            name:
              type: string
  responses:
    content:
      application/json:
        schema:
          type: object
```

#### GraphQL Workflow (src/functions/create.yaml)
```yaml
summary: Create Category
tasks:
  - id: mongo_category_create
    fn: datasource.mongo.Category.create
    args:
      data: <% inputs.body %>
```
4. use `gosdspeed gen-graphql-schema` to auto generate graphql schema.

5. use `godspeed dev `to start server. 

This configuration emphasizes the simplicity of implementing GraphQL within the Godspeed framework, promoting efficiency and clarity in API development.

Happy coding with Godspeed...🚀

