
# Godspeed WebSocket Plugin

Welcome to the [Godspeed](https://www.godspeed.systems/) WebSocket Plugin! 🔌

## Introduction

The **WebSocket Event Source** plugin enables your Godspeed microservice to handle real-time, bidirectional communication with clients. This is especially useful for building AI chat interfaces, collaborative tools, and live data dashboards.

This plugin leverages WebSockets and Zod schemas to validate and route client messages to your backend logic via Godspeed cloud events. It's designed to be extensible and production-ready.

---

## How to Use

### Step 1: Install Required Dependencies

Install the required packages:

```bash
godspeed plugin add @godspeedsystems/plugins-websocket-as-eventsource
````

### Step 2: Add Event Source Configuration

Create a file `src/eventsources/websocket.yaml`:

```yaml title="src/eventsources/websocket.yaml"
type: websocket
port: 8000
```

This will start a WebSocket server on port `8000`.

---

## Defining WebSocket Events

Create your events in the `src/events/` directory and connect them to handlers in `src/functions/`.

---

### Example: Gemini-Powered Streaming RAG Agent

This example sets up a streaming AI assistant using Google's Gemini model and LangGraph.

---

#### 1. Define the Event (`src/events/websocket_stream.yaml`)

```yaml
"websocket.stream":
  fn: stream_gemini
  schema:
    type: object
    required:
      - eventtype
      - payload
    properties:
      eventtype:
        type: string
      payload:
        type: object
        required:
          - message
        properties:
          message:
            type: string
```

---

#### 2. Define the Function (`src/functions/stream_gemini.ts`)

This function:

* Initializes a LangGraph state machine.
* Adds a RAG tool for retrieving relevant documents.
* Streams LLM-generated tokens back to the WebSocket client in real-time.

Key technologies:

* ✅ **LangGraph**: Agent state machine with tools and conditional logic
* ✅ **Gemini 2.0 Flash**: Streaming LLM
* ✅ **Zod**: Input schema validation
* ✅ **Godspeed**: Event-driven server-side architecture

```ts
import { GSContext, GSStatus } from '@godspeedsystems/core';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, Annotation } from '@langchain/langgraph';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { RAGPipeline } from '../helper/mcpRag';
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool_knowledge_prompt, core_system_prompt } from '../helper/prompts';
import { memorySaver } from '../helper/memory';

const seenThreads = new Set<string>();

export default async function stream_gemini(ctx: GSContext): Promise<GSStatus> {
  const { ws, clientId, payload } = ctx.inputs.data;

  if (!ws || ws.readyState !== ws.OPEN) {
    return new GSStatus(false, 400, 'WebSocket disconnected');
  }

  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    })
  });

  const ragTool = tool(async (input) => {
    const rag = new RAGPipeline();
    return await rag.run(input.query);
  }, {
    name: "get_relevant_docs",
    description: "Call to get relevant documents from user query.",
    schema: z.object({
      query: z.string().describe("User query to get relevant docs.")
    })
  });

  const toolnode = new ToolNode<typeof GraphState.State>([ragTool]);

  async function shouldRetrieve(state: typeof GraphState.State): Promise<string> {
    const lastMessage = state.messages.at(-1);
    return (lastMessage && "tool_calls" in lastMessage) ? "tools" : END;
  }

  async function agent(state: typeof GraphState.State) {
    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      streaming: true
    }).bindTools([ragTool]);

    const response = await llm.invoke(state.messages);
    return { messages: [response] };
  }

  const graph = new StateGraph(GraphState)
    .addNode('agent', agent)
    .addNode('tools', toolnode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldRetrieve)
    .addEdge('tools', 'agent');

  const runnable = graph.compile({ checkpointer: memorySaver });

  const threadId = clientId;
  const messages: BaseMessage[] = [];

  if (!seenThreads.has(threadId)) {
    messages.push(new SystemMessage([core_system_prompt, tool_knowledge_prompt].join('\n')));
    seenThreads.add(threadId);
  }

  messages.push(new HumanMessage(payload.message));

  try {
    let streamStarted = false;
    await runnable.stream(
      { messages },
      {
        configurable: { thread_id: threadId },
        callbacks: [
          {
            handleLLMNewToken: async (token) => {
              if (!streamStarted) {
                streamStarted = true;
                ws.send(JSON.stringify({ eventtype: 'stream.start', payload: { message: '[STREAM_START]' } }));
              }
              ws.send(JSON.stringify({ eventtype: 'stream.chunk', payload: { message: token || 'Retrieving documents...' } }));
            },
            handleLLMEnd: async () => {
              ws.send(JSON.stringify({ eventtype: 'stream.end', payload: { message: '[STREAM_END]' } }));
            }
          }
        ]
      }
    );
    return new GSStatus(true, 200, 'Streaming completed');
  } catch (err: any) {
    ctx.logger.error(`LangGraph error: ${err.message}`);
    ws.send(JSON.stringify({ eventtype: 'error', payload: { message: '[ERROR]' } }));
    return new GSStatus(false, 500, 'Streaming failed');
  }
}
```

---

## Sample Client Code

```js
const ws = new WebSocket("ws://localhost:8000?clientId=test-user");

ws.onopen = () => {
  ws.send(JSON.stringify({
    eventtype: "websocket.stream",
    payload: { message: "What is LangGraph and how does it work?" }
  }));
};

ws.onmessage = (msg) => {
  const { eventtype, payload } = JSON.parse(msg.data);
  console.log(`[${eventtype}]`, payload.message);
};
```

---

## Need Help?

* [Godspeed Docs](https://docs.godspeed.systems/)
* [LangChain Docs](https://js.langchain.com/)
* [Discord](https://discord.com/invite/mjBa3RvTP5)
* [Plugin GitHub](https://github.com/godspeedsystems/gs-plugins)

---

## Thank You for Using Godspeed WebSocket Plugin

Build AI agents, assistants, and real-time apps that scale beautifully with WebSocket and LangGraph.
