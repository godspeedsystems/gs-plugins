import {
  GSEventSource,
  GSCloudEvent,
  PlainObject,
  GSStatus,
  GSActor,
} from '@godspeedsystems/core';
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z, ZodRawShape } from 'zod';


export default class EventSource extends GSEventSource {
  private server!: McpServer;
  private transport = new StdioServerTransport();
  private connected = false;
  private timeoutTimer: NodeJS.Timeout | null = null;

  protected async initClient(): Promise<PlainObject> {
    this.server = new McpServer({
      name: this.config.name,
      version: this.config.version,
    });
    return this.server;
  }

  async subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (
      event: GSCloudEvent,
      eventConfig: PlainObject,
    ) => Promise<GSStatus>,
  ): Promise<void> {
    const server = this.client as McpServer;
    if (!server) throw new Error('MCP server not initialized');
    
    const paramDefs = eventConfig.params || [];
    const bodyDef = eventConfig.body;
    const zodShape: ZodRawShape = {};
    let bodyZod: z.ZodObject<any> | null = null;

    // Build param schema (query/path/header)
    for (const def of paramDefs) {
       if (typeof def !== 'object' || !def.name || !def.schema) continue;
       const name = def.name;
       const type = def.schema?.type || 'any';
       let zodType: z.ZodTypeAny;

       switch (type) {
         case 'string': zodType = z.string(); break;
         case 'number': zodType = z.number(); break;
         case 'boolean': zodType = z.boolean(); break;
         case 'object': zodType = z.record(z.any()); break;
         case 'array': zodType = z.array(z.any()); break;
         case 'date': zodType = z.coerce.date(); break;
         case 'unknown': zodType = z.unknown(); break;
         case 'any': zodType = z.any(); break;
         default: zodType = z.any();
       }

       zodShape[name] = def.required ? zodType : zodType.optional();
    }

    // Build body schema (nested under .body)
    if (bodyDef?.type === 'object' && bodyDef.properties) {
       const bodyShape: ZodRawShape = {};
       for (const [key, val] of Object.entries(bodyDef.properties)) {
          const type = (val as any).type || 'any';
          let zodType: z.ZodTypeAny;
          switch (type) {
             case 'string': zodType = z.string(); break;
             case 'number': zodType = z.number(); break;
             case 'boolean': zodType = z.boolean(); break;
             case 'object': zodType = z.record(z.any()); break;
             case 'array': zodType = z.array(z.any()); break;
             case 'date': zodType = z.coerce.date(); break;
             case 'unknown': zodType = z.unknown(); break;
             case 'any': zodType = z.any(); break;
             default: zodType = z.any();
          }
          bodyShape[key] = bodyDef.required?.includes(key) ? zodType : zodType.optional();
       }

       bodyZod = z.object(bodyShape);
       zodShape['body'] = bodyZod;
    }

    const schema = z.object(zodShape);

    const eventType =
      eventConfig.type || (eventConfig.uriTemplate ? 'resource' : 'tool');

    if (eventType === 'tool') {
      server.tool(
       eventKey,
       `Generated tool for ${eventKey}`,
       schema.shape,
       async (args: PlainObject) => {
            const cloudEvent = new GSCloudEvent(
            `tool.${eventKey}`,
             eventKey,
              new Date(),
              'mcp',
              '1.0',
              { body: args },
               'REST',
                new GSActor('user'),
               '',
           );

            const res = await processEvent(cloudEvent, eventConfig);

                return {
                      content: [
                        {
                          type: 'text',
                          text: res?.data?.context || res?.message,
                           },
                           {
                          type: 'text',
                          text: res?.data?.source_files,
                           }
                      ],
                };
          },
        );

    } else if (eventType === 'resource') {
      server.resource(
        eventKey,
        new ResourceTemplate(eventConfig.uriTemplate, { list: undefined }),
        async (uri: any, pathParams: any) => {
          const cloudEvent = new GSCloudEvent(
            `resource.${eventKey}`,
            eventKey,
            new Date(),
            'mcp',
            '1.0',
            { body: { uri: uri.href, ...pathParams } },
            'REST',
            new GSActor('user'),
            '',
          );
          const res = await processEvent(cloudEvent, eventConfig);
          return {
            contents: [
              {
                uri: uri.href,
                text: res?.message ?? `Handled resource ${eventKey}`,
              },
            ],
          };
        },
      );
    } else if (eventType === 'prompt') {
      server.prompt(eventKey, schema.shape, async (args: PlainObject) => {
        const cloudEvent = new GSCloudEvent(
          `prompt.${eventKey}`,
          eventKey,
          new Date(),
          'mcp',
          '1.0',
          { body: args },
          'REST',
          new GSActor('user'),
          '',
        );
        await processEvent(cloudEvent, eventConfig);
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Prompt for ${eventKey}:\n\n${JSON.stringify(
                  args,
                  null,
                  2,
                )}`,
              },
            },
          ],
        };
      });
    }

    if (!this.connected) {
      if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
      this.timeoutTimer = setTimeout(() => this.startServer(), 3000);
    }
  }

  private async startServer() {
    if (this.connected) return;
    try {
      await this.server.connect(this.transport);
      this.connected = true;
      console.info('[MCP] Server connected via stdio');
    } catch (err) {
      console.error('[MCP] Failed to start server:', err);
      process.exit(1);
    }
  }
}


const SourceType = 'ES';
const Type = "mcp"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mcp"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
