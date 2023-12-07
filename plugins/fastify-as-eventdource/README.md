# Godspeed Fastify Plugin

## Introduction

The Godspeed Fastify Plugin is an essential component of the Godspeed framework, designed to streamline the integration of event-driven and serverless functionalities into your projects. This plugin harnesses the power of Fastify, a fast and low overhead web framework for Node.js, to handle HTTP events. It simplifies the process of defining event subscriptions and processing incoming events, providing a robust foundation for building responsive and scalable applications.

## How to Use
When creating a Godspeed project using the CLI, you can add the plugin from the CLI and select `@godspeedsystems/plugins-fastify-as-http` to seamlessly integrate it into your project.
```bash
godspeed plugin add


       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝


? Please select godspeed plugin to install: (Press <space> to select, <Up and Down> to move rows)
┌──────┬────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐
│      │ Name                                   │ Description                                                                    │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ ❯◯   │ fastify-as-http                        │ Godspeed event source plugin for fastify as http server                        │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ aws-as-datasource                      │ aws as datasource plugin for Godspeed Framework                                │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ excel-as-datasource                    │ excel as datasource plugin for Godspeed Framework                              │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ mailer-as-datasource                   │ mailer as datasource plugin for Godspeed Framework                             │
├──────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│  ◯   │ elasticgraph-as-datasource             │ elasticgraph as datasource plugin for Godspeed Framework                       │
└──────┴────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```
- You will find the files in your project related to the Fastify plugin at `src/eventsources/types/fastify.ts` and `src/eventsources/http.yaml`.

### fastify.ts

```typescript
import { FastifyEventSource } from '@godspeedsystems/plugins-fastify-as-http';
export default FastifyEventSource;
```

### Fastify config (src/eventsources/http.yaml)

```yaml
type: fastify
port: 3000
```
### fastify event (src/events/sample.yaml)
```yaml
http.post./sample_api:
    fn: sample      #redirects to src/functions/sample.yaml
    body: 
      content:
        application/json:
          schema:
            type: object
            properties:
              name: 
                type: string
              message: 
                type: string                         
    params:     
      - in: query
        name: user
        required: true  
        schema: 
          type: string   
    responses:      
      200:
        content:
          application/json:
            schema:
              type: string
```
```yaml
http.<method>./<endpoint_url>:
    fn: <function_yaml>
    body:
    params:
    responses:
```
- The event YAML defines properties for handling specific HTTP requests within the Fastify app. In the YAML, `<method>` should be replaced with actual HTTP methods such as `GET, POST, PUT, or DELETE`, specifying how the app handles those requests. The `<endpoint_url>` field should contain the API URL for the respective HTTP route.
- A function will be triggered on sending a request to the respective url. The functions are created under `src/functions/`.

### Function to be called (src/functions/sample.yaml)
```yaml
summary:
description:
tasks:
    - id: example
      fn: com.gs.return #its an inbuilt function
      args: |
        <%"Hello "+inputs.query.user+". This is a message from body "+inputs.body.message%>
```

## How It Helps

The Godspeed Fastify Plugin provides the following benefits:

1. **Fastify Integration:** The plugin simplifies the setup of a Fastify application, enabling easy definition of routes and handlers for incoming HTTP events.

2. **Event Subscription:** Developers can effortlessly subscribe to specific HTTP events by defining routes and handlers using a consistent API.

3. **Customizable Configuration:** The plugin provides simple configuration options for Fastify settings, including port, request body limits, and file size limits.

4. **Integration with Godspeed Core:** Seamlessly works with the Godspeed Core library, facilitating the processing of cloud events and supporting event-driven architecture.

## Plugin Explaination

This plugin is designed to seamlessly integrate with the Godspeed framework, offering functionality related to event sources using Fastify, a performant web framework for Node.js. It allows you to create event sources that listen for incoming HTTP requests, triggering actions based on those requests.

## Plugin Components

The [plugin](/src/index.ts) consists of several key components:

### 1. `EventSource` Class

- This class extends `GSEventSource`, a base class provided by the Godspeed framework for creating event sources.

- It initializes an Fastify server to listen for incoming HTTP requests based on the provided configuration options.

- The `subscribeToEvent` method is used to define how the plugin should respond to specific HTTP routes. It maps incoming HTTP requests to Godspeed Cloud Events, processes them using a provided function, and sends a response.

- The `createGSEvent` static method is used to create a Godspeed Cloud Event from an incoming Fastify request.

### 2. Constants

- `SourceType`: A constant representing the source type of the plugin, which is 'ES' (event source).

- `Type`: A constant representing the loader file of the plugin. The final loader file will be located in the 'types' directory and named `${Type.js}`, where `Type` is 'fastify' in this case.

- `CONFIG_FILE_NAME`: In the context of an event source, this constant also serves as the event identifier. For a data source, it works as the data source name. In this plugin, it is set to 'http'.

- `DEFAULT_CONFIG`: A default configuration object with options like the port number for the Fastify server.


## Conclusion

The Godspeed Fastify Plugin is a valuable addition to the Godspeed framework, providing a seamless solution for integrating and managing event sources within your applications. With this plugin, handling HTTP requests, defining routes, and triggering actions become effortless, making it an indispensable tool for building responsive and scalable applications.

We welcome your feedback and contributions. If you have questions, suggestions, or encounter any issues while using the plugin, please reach out to us. Your insights and ideas can help us improve and enhance this plugin for the entire community.

We are excited to see the innovative projects you will create with the Fastify plugin, and we look forward to collaborating with you to make your projects even more successful. Happy coding!

### Get in Touch

- [Discord](https://discord.gg/c4DcdBA9)
- [Plugin Repository](https://github.com/godspeedsystems/gs-plugins/tree/main/plugins/fastify-as-http)
- [Issue Tracker](https://github.com/godspeedsystems/gs-plugins/issues)

