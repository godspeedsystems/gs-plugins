import {
  GSContext,
  GSDataSource,
  PlainObject,
  GSDataSourceAsEventSource,
  GSCloudEvent,
  GSStatus,
  GSActor,
  logger,
} from "@godspeedsystems/core";
import { Server, Socket, Namespace } from "socket.io";
import { createServer } from "http";
import crypto from "crypto";
import { z, ZodSchema } from "zod";
import jwt, { JwtPayload } from "jsonwebtoken";

interface ExtendedSocket extends Socket {
  clientId?: string;
  context?: Record<string, any>;
  heartbeatInterval?: NodeJS.Timeout;
  lastHeartbeat?: number;
}

const socketSchemas: Record<string, ZodSchema<any>> = {};
const CONNECTION_CONFIG = {
  heartbeatInterval: 30000,
  heartbeatTimeout: 300000,
  reconnectGracePeriod: 5000,
};

// Minimal JWT payload type for this datasource
type JWTPayload = JwtPayload & { username?: string };

// Inline JWT verification function (moved from helper/auth)
export function verifyToken(token: string, config: any): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config?.jwt?.secret, {
      issuer: config?.jwt?.issuer || "rag-node-api",
      algorithms: [config?.jwt?.algorithm || "HS256"],
    }) as JWTPayload;
    return decoded;
  } catch (error: any) {
    logger.warn("JWT verification failed:", error?.message || error);
    return null;
  }
}

class DataSource extends GSDataSource {
  private io!: Server;
  private httpServer: any;
  private activeConnections: Map<string, ExtendedSocket> = new Map();

  protected async initClient(): Promise<PlainObject> {
    const { port = 8000, cors = { origin: "*" } } = this.config;
    this.httpServer = createServer();

    this.io = new Server(this.httpServer, {
      cors,
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
    });

    logger.info(`Socket.IO server listening on port ${port}`);

    // 🔒 Authentication middleware
    this.io.use((socket: ExtendedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (token) {
        const decoded = verifyToken(token as string, this.config);
        if (decoded) {
          socket.context = {
            connectedAt: Date.now(),
            messagesReceived: 0,
            user: decoded,
            authenticated: true,
          };
          socket.clientId = `user-${decoded.username}-${crypto.randomUUID()}`;
          logger.info(`Authenticated client connected: ${socket.clientId}`);
          return next();
        }
        logger.warn("Invalid token, rejecting connection");
        return next(new Error("Invalid token"));
      }

      // guest connection
      socket.context = { connectedAt: Date.now(), authenticated: false };
      socket.clientId = `guest-${crypto.randomUUID()}`;
      logger.info(`Guest client connected: ${socket.clientId}`);
      next();
    });

    // ✅ Handle new connections
    this.io.on("connection", (socket: ExtendedSocket) => {
      this.handleConnection(socket);
    });

    this.httpServer.listen(port);
    return { io: this.io, httpServer: this.httpServer };
  }

  private handleConnection(socket: ExtendedSocket) {
    logger.info(`Socket connected: ${socket.clientId}`);
    if (socket.clientId) this.activeConnections.set(socket.clientId, socket);

    this.setupHeartbeat(socket);

    // Generic event handler
    socket.onAny((event: string, message: any) => {
      if (event.startsWith("socket.io")) return;

      const schema = socketSchemas[event];
      try {
        const validated = schema ? schema.parse(message) : message;
        socket.context!.messagesReceived++;
        socket.emit("event.received", { event, timestamp: Date.now() });
        logger.debug(`Event received: ${event}`);
      } catch (err: any) {
        socket.emit("stream.error", { message: err.message });
      }
    });

    socket.on("heartbeat", () => {
      socket.lastHeartbeat = Date.now();
      socket.emit("heartbeat.ack", { timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => this.handleDisconnect(socket, reason));
  }

  private setupHeartbeat(socket: ExtendedSocket) {
    socket.lastHeartbeat = Date.now();
    socket.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - (socket.lastHeartbeat || now) > CONNECTION_CONFIG.heartbeatTimeout) {
        logger.warn(`Heartbeat timeout for ${socket.clientId}`);
        socket.disconnect(true);
      } else {
        socket.emit("ping", { timestamp: now });
      }
    }, CONNECTION_CONFIG.heartbeatInterval);
  }

  private handleDisconnect(socket: ExtendedSocket, reason: string) {
    if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
    logger.info(`Client disconnected: ${socket.clientId} - ${reason}`);

    setTimeout(() => {
      if (socket.clientId && this.activeConnections.get(socket.clientId) === socket) {
        this.activeConnections.delete(socket.clientId);
        logger.info(`Cleaned up ${socket.clientId}`);
      }
    }, CONNECTION_CONFIG.reconnectGracePeriod);
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    try {
      const { event, data } = args;
      // Emit on the root namespace first
      this.io.emit(event, data);

      // Also attempt to emit on any other initialized namespaces so clients
      // connected to non-root namespaces (e.g. '/internal') receive the event.
      // Access internal namespace map defensively because it's not part of the
      // public API across versions.
      try {
        const anyIo: any = this.io as any;
        const nsps = anyIo._nsps || anyIo.nsps || anyIo.of && new Map([["/", anyIo.of("/")]]);
        if (nsps instanceof Map) {
          for (const [name, nsp] of nsps) {
            try {
              // avoid double-emitting to root namespace if we've already emitted
              if (name === "/") continue;
              nsp.emit(event, data);
            } catch (e) {
              logger.debug(`Failed to emit on namespace ${name}: ${String(e)}`);
            }
          }
        }
      } catch (e) {
        logger.debug('Could not iterate namespaces to emit event:', String(e));
      }

      return { success: true, message: "Event broadcasted" };
    } catch (error) {
      throw error;
    }
  }

  async cleanup() {
    logger.info("Cleaning up Socket.IO server...");
    for (const socket of this.activeConnections.values()) {
      if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
    }
    this.io.close();
    this.httpServer.close();
    this.activeConnections.clear();
  }
}

class EventSource extends GSDataSourceAsEventSource {
  private initializedNamespaces = new WeakSet<Namespace>();
  private io!: Server;

  constructor(config: PlainObject, datasourceClient: PlainObject) {
    // ✅ Pass both arguments to parent constructor
    super(config, datasourceClient);

    // ✅ Access the Socket.IO server instance from datasource client
    this.io = datasourceClient.io;
  }

  async subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (
      event: GSCloudEvent,
      eventConfig: PlainObject
    ) => Promise<GSStatus>
  ): Promise<void> {
    try {
      const match = eventKey.match(/^socket\.((\/[a-zA-Z0-9_-]+)?)\.?(.+)?$/);
      const namespaceName = match?.[2] || "/";
      const eventName = match?.[3] || "";

      const nsp = this.io.of(namespaceName);

      // Register schema if provided
      if (eventConfig.schema) {
        const schema = this.convertJsonSchemaToZod(eventConfig.schema);
        socketSchemas[`${namespaceName}:${eventName}`] = schema;
      }

      // Initialize namespace only once
      if (!this.initializedNamespaces.has(nsp)) {
        this.initializedNamespaces.add(nsp);
        nsp.on("connection", (socket: ExtendedSocket) => {
          logger.info(`Client connected to namespace ${namespaceName}`);
          this.setupHeartbeat(socket);
          socket.on("disconnect", (r) => this.handleDisconnect(socket, r));
        });
      }

      // Bind event
      nsp.on("connection", (socket: ExtendedSocket) => {
        socket.on(eventName, async (payload: any) => {
          try {
            const schema = socketSchemas[`${namespaceName}:${eventName}`];
            const validated = schema ? schema.parse(payload) : payload;

            const cloudEvent = new GSCloudEvent(
              `socket-${Date.now()}`,
              eventKey,
              new Date(),
              "socket",
              "1.0",
              { payload: validated },
              "socket",
              new GSActor("user"),
              {}
            );

            const status = await processEvent(cloudEvent, eventConfig);
            if (!status.success) socket.emit("stream.error", { message: status.message });
          } catch (err: any) {
            socket.emit("stream.error", { message: err.message });
          }
        });
      });

      logger.info(`Subscribed to ${eventKey} on namespace ${namespaceName}`);
    } catch (error) {
      throw error;
    }
  }

  private setupHeartbeat(socket: ExtendedSocket) {
    socket.lastHeartbeat = Date.now();
    socket.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - (socket.lastHeartbeat || now) > CONNECTION_CONFIG.heartbeatTimeout) {
        socket.disconnect(true);
      }
    }, CONNECTION_CONFIG.heartbeatInterval);
  }

  private handleDisconnect(socket: ExtendedSocket, reason: string) {
    if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
    logger.info(`Namespace socket disconnected: ${socket.clientId} - ${reason}`);
  }

  private convertJsonSchemaToZod(schema: PlainObject): ZodSchema {
    const zodShape: Record<string, z.ZodTypeAny> = {};
    if (schema?.type === "object" && schema.properties) {
      for (const [key, val] of Object.entries(schema.properties)) {
        const prop = val as PlainObject;
        let zodType: z.ZodTypeAny;
        switch (prop.type) {
          case "string":
            zodType = z.string();
            break;
          case "number":
            zodType = z.number();
            break;
          case "boolean":
            zodType = z.boolean();
            break;
          case "array":
            zodType = z.array(this.convertJsonSchemaToZod(prop.items || {}));
            break;
          case "object":
            zodType = this.convertJsonSchemaToZod(prop);
            break;
          default:
            zodType = z.any();
        }
        zodShape[key] = schema.required?.includes(key)
          ? zodType
          : zodType.optional();
      }
      return z.object(zodShape);
    }
    return z.any();
  }
}

// ------------------ Exports ------------------

const SourceType = "BOTH";
const Type = "socket";
const CONFIG_FILE_NAME = "socket";
const DEFAULT_CONFIG = {
  port: 8000,
  cors: { origin: "*", methods: ["GET", "POST"] },
};

export {
  DataSource,
  EventSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
};
