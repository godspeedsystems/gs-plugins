import WebSocket from 'ws';
import { GSEventSource, GSCloudEvent, GSActor, PlainObject, GSStatus } from '@godspeedsystems/core';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { z, ZodSchema, ZodRawShape } from 'zod';

interface ExtendedWebSocket extends WebSocket {
  clientId?: string;
  context?: Record<string, any>;
}

const wsEventBus = new EventEmitter();
const websocketSchemas: Record<string, ZodSchema<any>> = {};

export default class WebSocketEventSource extends GSEventSource {
  private wss!: WebSocket.Server;

  protected async initClient(): Promise<PlainObject> {
    const { port = 8000 } = this.config;
    this.wss = new WebSocket.Server({ port });
    console.log(`WebSocketEventSource listening on port ${port}`);

    this.wss.on('connection', (ws: ExtendedWebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      ws.clientId = url.searchParams.get('clientId') || `anon-${crypto.randomUUID()}`;
      ws.context = { connectedAt: Date.now(), messagesReceived: 0 };

      console.log(`Client connected: ${ws.clientId}`);

      ws.on('message', (rawData: WebSocket.RawData) => {
        try {
          const message = JSON.parse(rawData.toString());
          const eventtype = message.eventtype;
          const schema = websocketSchemas[eventtype];

          if (!eventtype || !schema) {
            ws.send(JSON.stringify({
              eventtype: 'stream.error',
              payload: { message: `Unknown or unconfigured event type: ${eventtype}` }
            }));
            return;
          }

          const validated = schema.parse(message);
          ws.context!.messagesReceived += 1;

          wsEventBus.emit(eventtype, {
            ws,
            clientId: ws.clientId,
            payload: validated.payload
          });

        } catch (e: any) {
          console.error('Zod Validation Error:', e.errors);
          ws.send(JSON.stringify({ eventtype: 'stream.error', payload: { message: e.message || 'Invalid format' } }));
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${ws.clientId}`);
      });
    });

    return { server: this.wss };
  }

  async subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (event: GSCloudEvent, config: PlainObject) => Promise<GSStatus>
  ): Promise<void> {
    const defaultSchema = {
      type: 'object',
      required: ['eventtype', 'payload'],
      properties: {
        eventtype: { type: 'string' },
        payload: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' }
          }
        }
      }
    };

    const schemaConfig = eventConfig.schema || defaultSchema;
    try {
      const zodSchema = this.convertJsonSchemaToZod(schemaConfig);
      websocketSchemas[eventKey] = zodSchema;
      console.log(`Schema registered for ${eventKey}`);
    } catch (err) {
      console.error(`Failed to compile schema for ${eventKey}:`, err);
    }

    wsEventBus.on(eventKey, async ({ ws, clientId, payload }: { ws: ExtendedWebSocket; clientId: string; payload: any }) => {
      const cloudEvent = new GSCloudEvent(
        `ws-${Date.now()}`,
        eventKey,
        new Date(),
        'socket',
        '1.0',
        { ws, clientId, payload },
        'socket',
        new GSActor('user'),
        {}
      );

      try {
        const status = await processEvent(cloudEvent, eventConfig);
        if (!status.success && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ eventtype: 'stream.error', payload: { message: status.message } }));
        }
      } catch (err) {
        console.error(`Error in handler for ${eventKey}`, err);
      }
    });

    console.log(`Event handler registered for ${eventKey}`);
  }

  private convertJsonSchemaToZod(schema: PlainObject): ZodSchema {
    const zodShape: ZodRawShape = {};

    if (schema?.type === 'object' && schema.properties) {
      for (const [key, val] of Object.entries(schema.properties)) {
        const propSchema = val as PlainObject;
        const type = propSchema.type || 'any';
        let zodType: z.ZodTypeAny;

        switch (type) {
          case 'string': zodType = z.string(); break;
          case 'number': zodType = z.number(); break;
          case 'boolean': zodType = z.boolean(); break;
          case 'array': {
            const itemType = propSchema.items?.type || 'any';
            let zodItemType: z.ZodTypeAny;
            switch (itemType) {
              case 'string': zodItemType = z.string(); break;
              case 'number': zodItemType = z.number(); break;
              case 'boolean': zodItemType = z.boolean(); break;
              case 'object': zodItemType = this.convertJsonSchemaToZod(propSchema.items); break;
              default: zodItemType = z.any();
            }
            zodType = z.array(zodItemType);
            break;
          }
          case 'object':
            zodType = this.convertJsonSchemaToZod(propSchema);
            break;
          default:
            zodType = z.any();
        }

        zodShape[key] = schema.required?.includes(key) ? zodType : zodType.optional();
      }

      return z.strictObject(zodShape);
    }

    throw new Error('Invalid schema definition: expected type=object with properties');
  }

  // Optional: external push API
//   public broadcastToClients(filter: (ws: ExtendedWebSocket) => boolean, message: PlainObject): void {
//     this.wss.clients.forEach((client: ExtendedWebSocket) => {
//       if (client.readyState === WebSocket.OPEN && filter(client)) {
//         client.send(JSON.stringify(message));
//       }
//     });
//   }
}

export const SourceType = 'ES';
export const Type = 'websocket';
export const CONFIG_FILE_NAME = 'websocket';
export const DEFAULT_CONFIG = { port: 8000 };
