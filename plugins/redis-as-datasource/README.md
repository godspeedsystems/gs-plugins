# godspeed-plugin-Redis-as-datasource


Welcome to the [Godspeed](https://www.godspeed.systems/) Redis Plugin! 🚀

The Godspeed Redis Plugin provides integration with Redis, allowing developers to seamlessly interact with Redis databases within the Godspeed framework. This plugin simplifies the process of working with Redis data, providing a standardized way to perform common Redis operations.


## How to add Redis plugin in your project:
- Create a godspeed project from the CLI and add the Redis plugin the plugin from the CLI and select the `@godspeedsystems/plugins-redis-as-datasource` to integrate the plugin.

```
macbookpro@MacbookPros-MBP gs-test-project % godspeed plugin add   


       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝


? Please select godspeed plugin to install: (Press <space> to select, <Up and Down> to move rows)
┌────┬───────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
│    │ Name                              │ Description                                                     │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ kafka-as-datasource-as-eventsource│ kafka as datasource-as-eventsource plugin for Godspeed Framework│
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ cron-as-eventsource               │ Cron as eventsource plugin for Godspeed Framework               │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ ❯◯ │ redis-as-datasource               │ redis as datasource plugin for Godspeed Framework               │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ elasticgraph-as-datasource        │ elasticgraph as datasource plugin for Godspeed Framework        │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ axios-as-datasource               │ Axios as datasource plugin for Godspeed Framework               │
└────┴───────────────────────────────────┴─────────────────────────────────────────────────────────────────┘

```
- You will find the files in your project related to the Redis plugin at `src/datasources/types/redis.ts` and `src/datasources/redis.yaml`.

Configure your Redis data source with connection string. 
### redis config (src/datasources/redis.yaml)
```yaml
type: redis
url: redis://alice:foobared@awesome.redis.server:6380

```
Here are some example workflows of using the Redis plugin in your Godspeed workflows:

### Workflow to Get a Value from Redis:

id: get_redis_value
tasks:
  - id: get_task
    fn: datasource.redis.get
    args:
      key: 'example_key'

### Workflow to Set a Value in Redis:

id: set_redis_value
tasks:
  - id: set_task
    fn: datasource.redis.set
    args:
      key: 'example_key'
      value: 'example_value'

## How It Helps

The Godspeed Redis Plugin offers the following benefits:

1. **Redis Integration:** The plugin abstracts away the complexities of setting up a Redis client, making it effortless to connect to Redis databases and perform operations.

2. **Unified Data Source:** Developers can use a uniform API to define data sources that interact with Redis. This enhances consistency and ease of use across different parts of the application.

3. **Error Handling:** The plugin includes robust error handling, allowing developers to gracefully handle scenarios such as connection issues, key not found, and other Redis-related errors.

4. **Integration with Godspeed Core:** The plugin seamlessly integrates with the Godspeed Core library, aligning with the principles of the Godspeed framework and enabling streamlined event-driven workflows.

## Plugin Components

The plugin consists of the following key components:

### 1. `DataSource` Class

- This class extends `GSDataSource`, a base class provided by the Godspeed framework for creating data sources.

- It initializes a Redis client to interact with Redis databases based on the provided configuration options.

- The `execute` method is used to define how the plugin should perform Redis operations. It maps incoming parameters to Redis commands, processes the operation, and handles various response scenarios.

### 2. Constants

- `SourceType`: A constant representing the source type of the plugin, which is 'DS' (data source).

- `Type`: A constant representing the loader file of the plugin. The final loader file will be located in the 'types' directory and named `${Type.js}`, where `Type` is 'redis' in this case.

- `CONFIG_FILE_NAME`: In the context of a data source, this constant also serves as the data source name. In this plugin, it is set to 'redis'.

- `DEFAULT_CONFIG`: A default configuration object with Redis options like host, port, and other settings.


### Conclusion

The Godspeed Redis Plugin is a valuable addition to the Godspeed framework, providing a standardized way to interact with Redis databases. With this plugin, you can effortlessly perform Redis operations, handle responses, and streamline data storage within your applications.

We value your feedback and contributions. If you have any questions, suggestions, or encounter issues while using the plugin, please reach out to us. Your insights and ideas help us enhance and improve this plugin for the entire Godspeed community.

We're excited to see how you leverage the Godspeed Redis Plugin in your projects and look forward to collaborating with you to make your applications even more powerful. Happy coding!



## Thank You For Using Godspeed 
