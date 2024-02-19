# godspeed-plugin-mem-chache-as-datasource


Welcome to the [Godspeed](https://www.godspeed.systems/) mem-cache Plugin! 🚀

The Godspeed mem-cache Plugin provides caching interfaces, allowing developers to seamlessly use in-memory cache within the Godspeed framework.

## How to add mem-cache plugin in your project:
- Create a godspeed project from the CLI and add the mem-cache plugin from the CLI and select the `@godspeedsystems/plugins-mem-cache-as-datasource` to integrate the plugin.

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
│ ❯◯ │ mem-cache-as-datasource           │ mem-cache as datasource plugin for Godspeed Framework           │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ elasticgraph-as-datasource        │ elasticgraph as datasource plugin for Godspeed Framework        │
├────┼───────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│  ◯ │ axios-as-datasource               │ Axios as datasource plugin for Godspeed Framework               │
└────┴───────────────────────────────────┴─────────────────────────────────────────────────────────────────┘

```
- You will find the files in your project related to the plugin at `src/datasources/types/mem-cache.ts` and `src/datasources/mem-cache.yaml`.

Configure your data source.
### mem-cache config (src/datasources/mem-cache.yaml)
```yaml
type: mem-cache
```
Here are some example workflows of using this plugin in your Godspeed workflows:

### Sample events and workflows:
Create two events and two function handlers for each event by the name helloworld2 and helloworld3 respectively.

```yaml
# Events
"http.get./helloworld2":
  fn: helloworld2
"http.get./helloworld3":
  fn: helloworld3

# Functions (Helloworld2 workflow)
id: helloworld2_workflow
tasks:
  - id: helloworld2_workflow_first_task
 
    fn: com.gs.transform
    args:
      name: helloworld2
    caching:
      key: xyz
      # datasource: memcache #This field should be definitely set if config/default.caching is not set. Else is optional
      # noRead: true #if this is set get(key) method will not be called for this task
      # noWrite: true #the result of this task will not be written, even if cache_on_failure is set to true. i.e. set() method will not be called
    

# Functions (Helloworld3 workflow)
id: helloworld3_workflow
tasks:
  - id: helloworld3_workflow_first_task
    caching:
      key: abc
      invalidate: xyz #helloworld2 key
      # noRead: true #if this is set get(key) method will not be called for this task
      # noWrite: true #the result of this task will not be written, even if cache_on_failure is set to true. i.e. set() method will not be called
      datasource: mem-cache #This field should be definitely set if config/default.caching is not set. Else is optional
    fn: com.gs.transform
    args:
      name: helloworld3
```

## Plugin Components

The plugin consists of the following key components:

### 1. `DataSource` Class

- This class extends `GSCachingDatasource`, a base class provided by the Godspeed framework for creating data sources.

- It initializes a client which provides an object to use as in-memory cache.

- The `set` method is used to set the key and value of the cache.

- The `get` method is used to get value from the cache.

- The `del` method is used to delete value from the cache.

### 2. Constants

- `SourceType`: A constant representing the source type of the plugin, which is 'DS' (data source).

- `Type`: A constant representing the loader file of the plugin. The final loader file will be located in the 'types' directory and named `${Type.js}`, where `Type` is 'mem-cache' in this case.

- `CONFIG_FILE_NAME`: In the context of a data source, this constant also serves as the data source name. In this plugin, it is set to 'mem-cache'.

### Conclusion

The Godspeed mem-cache Plugin is a valuable addition to the Godspeed framework, providing a standardized way to use in-memory cache.

We value your feedback and contributions. If you have any questions, suggestions, or encounter issues while using the plugin, please reach out to us. Your insights and ideas help us enhance and improve this plugin for the entire Godspeed community.

We're excited to see how you leverage the Godspeed mem-cache Plugin in your projects and look forward to collaborating with you to make your applications even more powerful. Happy coding!



## Thank You For Using Godspeed 
