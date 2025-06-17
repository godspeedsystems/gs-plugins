
# Godspeed MCP Plugin
Welcome to the [Godspeed](https://www.godspeed.systems/) MCP Plugin! 🚀

## Introduction

The **Model-Context Protocol (MCP) Event Source** plugin transforms your Godspeed microservice into a set of capabilities that AI agents can discover and execute. It acts as a bridge, allowing an external AI agent (like one running in a VS Code extension) to interact with your Godspeed functions as if they were native tools or resources.

This plugin leverages the `@modelcontextprotocol/sdk` and communicates over `stdio` (standard input/output), making it ideal for local, process-based communication between an agent and your service.

## How to Use

### Step 1: Install the Plugin
Create a godspeed project from the CLI, and then add the plugin to your project using the Godspeed CLI:

```bash
godspeed plugin add @godspeedsystems/plugins-mcp-as-eventsource
```

### Step 2: Configure the MCP Event Source
Create or modify the `src/eventsources/mcp.yaml` file to define your MCP server's identity.

```yaml title="src/eventsources/mcp.yaml"
type: mcp
name: 'mcp-eventsource'          # A unique name for your capabilities
version: '1.0.0'                 # The version of your toolset
```
This configuration is essential for the AI agent to identify and discover your service's capabilities.

## Defining MCP Events

You can define three types of MCP capabilities—**Tools**, **Resources**, and **Prompts**—in your `src/events/` directory.

The event key for all MCP events follows the format: `mcp.<your_event_name>`.

### 1. Defining a Tool
A **Tool** is a function an AI agent can execute to perform an action. The plugin automatically creates a type-safe input schema from your event's `body` and `params` definitions.

**Event Schema (`src/events/mcpevent1.yaml`):**
```yaml
"mcp.get-forecast":
  fn: handle_weather_forecast
  type: tools
  params:
    - name: latitude
      in: query
      required: true
      schema:
        type: number
        minimum: -90
        maximum: 90
    - name: longitude
      in: query
      required: true
      schema:
        type: number
        minimum: -180
        maximum: 180
```

**Function Handler (`src/functions/handle_weather_forcast.yaml`):**
```yaml
id: handle_weather_forecast
summary: Handle weather forecast from MCP
tasks:
  - id: process_forecast
    description: Process weather forecast for the specified coordinates
    fn: com.gs.return
    args:
      data: "Weather forecast for coordinates: <%inputs.params.latitude%>, <%inputs.params.longitude%>"
      code: 200
      success: true
```

### 2. Defining a Resource
A **Resource** represents contextual information an agent can retrieve via a URI.

**Event Schema (`src/events/mcpevent1.yaml`):**
```yaml
"mcp.user-profile":
  fn: get_user_profile
  type: resource
  uriTemplate: users://{userId}/profile
  params:
    - name: userId
      in: path
      required: true
      schema:
        type: string

```

**Function Handler (`src/functions/get_user_profile.yaml`):**
```yaml
id: get_user_profile
summary: Get user profile from resource URI
tasks:
  - id: return_profile
    description: Return profile info for the specified userId
    fn: com.gs.return
    args:
      data: "User profile for: <%inputs.params.userId%>"
      code: 200
      success: true
```

## How It Helps
The MCP plugin offers unique advantages for building AI-powered applications:
1.  **AI Agent Integration:** Makes your microservice's logic directly available to AI agents, enabling complex, automated workflows.
2.  **Schema-Driven Safety:** Automatically generates `Zod` schemas from your existing Godspeed event definitions, ensuring all agent inputs are type-safe and validated.
3.  **Standardized Communication:** Implements the Model-Context Protocol, providing a standard way for agents and tools to interact.
4.  **Decoupled Logic:** Your core Godspeed functions (`fn`) remain unchanged. The plugin handles the translation between the MCP format and Godspeed's standard `GSCloudEvent`, preserving the decoupled architecture.

## Plugin Explanation

This plugin is designed to integrate Model-Context Protocol with the Godspeed framework, allowing your service to act as an MCP server.

### Plugin Components
- **`EventSource` Class:** This class extends `GSEventSource` and manages the lifecycle of the MCP server. It initializes the server, subscribes Godspeed events as MCP capabilities, and handles the connection to the agent over `stdio`.
- **`subscribeToEvent` Method:** This is the core of the plugin. It reads the Godspeed event schema (`mcp.<event_name>`), determines if it's a `tool`, `resource`, or `prompt`, generates the appropriate `Zod` schema for input validation, and registers it with the underlying `McpServer` instance.
- **`initClient` Method:** Initializes the `McpServer` with the configuration provided in `mcp.yaml`.
- **Connection Debouncing:** The plugin intelligently waits for a few seconds after the first event is subscribed before connecting to the agent. This ensures that all capabilities are registered before the agent attempts discovery, preventing race conditions.

## Get in Touch
- [Discord](https://discord.com/invite/mjBa3RvTP5)
- [Plugin Repository](https://github.com/godspeedsystems/gs-plugins)
- [Issue Tracker](https://github.com/godspeedsystems/gs-plugins/issues)

## Thank You For Using Godspeed