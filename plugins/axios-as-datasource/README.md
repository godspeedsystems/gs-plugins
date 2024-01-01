## godspeed-Plugin-axios-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) Axios Plugin! 🚀


The Godspeed Axios Plugin provides seamless integration with the Axios library for making HTTP requests within the Godspeed framework. It simplifies the process of defining and executing HTTP requests, making it easy to interact with external APIs.

## How to Use
- Create a godspeed project from the CLI and by default the axios plugin is integrated into your project if not, add the plugin from the CLI and select the `@godspeedsystems/plugins-axios-as-datasource` to integrate the plugin.
```
godspeed plugin add   


       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝


? Please select godspeed plugin to install: (Press <space> to select, <Up and Down> to move rows)
┌──────┬───────────────────────────────────┬──────────────────────────────────────────────────────────────────┐
│      │ Name                              │ Description                                                      │
├──────┼───────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│  ◯   │ kafka-as-datasource-as-eventsource│ kafka as datasource-as-eventsource plugin for Godspeed Framework │
├──────┼───────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│  ◯   │ cron-as-eventsource               │ Cron as eventsource plugin for Godspeed Framework                │
├──────┼───────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│  ◯   │ redis-as-datasource               │ redis as datasource plugin for Godspeed Framework                │
├──────┼───────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│  ◯   │ elasticgraph-as-datasource        │ elasticgraph as datasource plugin for Godspeed Framework         │
├──────┼───────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ ❯◯   │ axios-as-datasource               │ Axios as datasource plugin for Godspeed Framework                │
└──────┴───────────────────────────────────┴──────────────────────────────────────────────────────────────────┘

```
- You will find the files in your project related to the axios plugin at `src/datasources/types/axios.ts` and `src/datasources/api.yaml`.

### axios.ts (src/datasources/types/axios.ts)

```typescript
import { DataSource } from '@godspeedsystems/plugins-axios-as-datasource';
export default DataSource;
```

### axios config (src/datasources/api.yaml)

```yaml
type: axios
base_url: http://localhost:4000
```

### Axios Workflow (src/functions/sample.yaml)
```
id: sample
tasks:
  - id: first_task
    fn: datasource.api.get./api/items
    args:
```
The axios request configuration options, such as headers, params, data, and timeout, can be directly passed as arguments (args).

```
args:
    headers:
    'X-Requested-With': 'XMLHttpRequest'
    params:
    ID: 12345
    data:
    firstName: 'Fred'
    timeout: 1000
    withCredentials: false
    auth:
    username: 'janedoe'
    password: 's00pers3cret'
    responseType: 'json'
    responseEncoding: 'utf8'
    xsrfCookieName: 'XSRF-TOKEN'
    xsrfHeaderName: 'X-XSRF-TOKEN'
    maxContentLength: 2000
    maxBodyLength: 2000
    maxRedirects: 5
    socketPath: null
    proxy:
    protocol: 'https'
    host: '127.0.0.1'
    port: 9000
    auth:
        username: 'mikeymike'
        password: 'rapunz3l'
    decompress: true
```
 To get more clarity checkout about [Axios configuration]( https://axios-http.com/docs/req_config)


## How It Helps

The Godspeed Axios Plugin offers the following advantages:

1. **Axios Integration:** The plugin abstracts away the complexities of setting up Axios instances, making it effortless to configure and execute HTTP requests.

2. **Unified DataSource:** Developers can use a uniform API to define data sources that make HTTP requests using Axios. This enhances consistency and ease of use across different parts of the application.

3. **Error Handling:** The plugin includes robust error handling, allowing developers to gracefully handle various scenarios, such as server timeouts, request setup failures, and server-side errors.

4. **Integration with Godspeed Core:** The plugin seamlessly integrates with the Godspeed Core library, aligning with the principles of the Godspeed framework and enabling streamlined event-driven workflows.


## Plugin Components

The plugin consists of the following key components:

### 1. `DataSource` Class

- This class extends `GSDataSource`, a base class provided by the Godspeed framework for creating data sources.

- It initializes an Axios instance to make HTTP requests based on the provided configuration options.

- The `execute` method is used to define how the plugin should execute HTTP requests. It maps incoming parameters to Axios request properties, processes the request, and handles various response scenarios.

### 2. Constants

- `SourceType`: A constant representing the source type of the plugin, which is 'DS' (data source).

- `Type`: A constant representing the loader file of the plugin. The final loader file will be located in the 'types' directory and named `${Type.js}`, where `Type` is 'axios' in this case.

- `CONFIG_FILE_NAME`: In the context of a data source, this constant also serves as the data source name. In this plugin, it is set to 'api'.

- `DEFAULT_CONFIG`: A default configuration object with Axios options like base URL and other settings.


## Conclusion

The Godspeed Axios Plugin is a valuable addition to the Godspeed framework, providing a standardized way to make HTTP requests using the Axios library. With this plugin, you can easily integrate with external APIs, handle responses, and streamline data retrieval within your applications.

We welcome your feedback and contributions. If you have any questions, suggestions, or encounter issues while using the plugin, please reach out to us. Your insights and ideas help us enhance and improve this plugin for the entire Godspeed community.

We're excited to see how you leverage the Godspeed Axios Plugin in your projects and look forward to collaborating with you to make your applications even more powerful. Happy coding!


## Thank You For Using Godspeed 