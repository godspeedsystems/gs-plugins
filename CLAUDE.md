# gs-plugins — Repository Memory for Claude

## What This Repo Is

Official Godspeed Framework plugin monorepo. Each plugin lives under `plugins/<name>/` and is published independently to npm as `@godspeedsystems/plugins-<name>`. The root is a plain npm monorepo (no Nx/Turborepo) with shared dev tooling.

---

## Repo Layout

```
gs-plugins/
├── plugins/                    # All official plugins
│   └── <name>/
│       ├── src/index.ts        # Entire plugin logic (single file)
│       ├── package.json        # @godspeedsystems/plugins-<name>
│       ├── tsconfig.json       # Compiles src/ → dist/ (CommonJS, ES6 target)
│       ├── README.md
│       ├── .gitignore          # ignores node_modules, dist
│       └── .npmignore          # publishes only dist/, excludes src/, tsconfig, lock
├── devops-plugins/             # Kubernetes/infra plugins (separate structure)
├── utilities/
├── eslint.config.js            # ESLint with TypeScript + JSON + Markdown
├── .prettierrc                 # 2-space, 100 col, double quotes, trailing commas
└── package.json                # Root — dev tooling only (husky, lint-staged, eslint)
```

---

## Plugin Types

Three types exist, selected at creation time:

| Type | `SourceType` | Base Class(es) | Use Case |
|------|-------------|----------------|----------|
| `DataSource` | `'DS'` | `GSDataSource` | Outbound integrations (HTTP, DB, cache, AI) |
| `EventSource` | `'ES'` | `GSEventSource` | Inbound triggers (HTTP servers, cron, WebSocket servers) |
| `DataSource-As-EventSource` | `'BOTH'` | `GSDataSource` + `GSDataSourceAsEventSource` | Both directions (Kafka, Socket.IO, Salesforce) |

---

## Core Interface — Every Plugin's `src/index.ts`

### Required Exports (all plugins)

```ts
export {
  DataSource,      // or EventSource, or both
  SourceType,      // 'DS' | 'ES' | 'BOTH'
  Type,            // loader filename: framework loads types/${Type}.js
  CONFIG_FILE_NAME, // datasource: config file base name; eventsource: event identifier prefix
  DEFAULT_CONFIG,  // default config object (can be {})
}
```

The default export must be the primary class.

### DataSource Pattern

```ts
import { GSContext, GSDataSource, GSStatus, PlainObject } from "@godspeedsystems/core";

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    // called once on startup — return the client (sdk instance, db connection, etc.)
    // access this.config for plugin config values
    return myClient;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    // called per workflow invocation
    // args.meta.fnNameInWorkflow = "datasource.<ds_name>.<method>"
    // return GSStatus or throw
    return new GSStatus(true, 200, undefined, responseData);
  }
}

const SourceType = 'DS';
const Type = 'my-plugin';         // → types/my-plugin.js in the framework
const CONFIG_FILE_NAME = 'api';   // → src/datasources/api.yaml in a Godspeed project
const DEFAULT_CONFIG = {};
```

### EventSource Pattern

```ts
import { GSEventSource, GSCloudEvent, GSStatus, GSActor, PlainObject } from "@godspeedsystems/core";

export default class EventSource extends GSEventSource {
  protected initClient(): Promise<PlainObject> {
    // return the server/scheduler instance
  }

  async subscribeToEvent(
    eventKey: string,
    eventConfig: PlainObject,
    processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>
  ): Promise<void> {
    // wire up listener; on each event construct GSCloudEvent and call processEvent()
  }
}

const SourceType = 'ES';
const Type = 'my-plugin';
const CONFIG_FILE_NAME = 'my-plugin'; // also used as event key prefix
const DEFAULT_CONFIG = {};
```

### DataSource-As-EventSource Pattern

Implements both classes in one file. `DataSource` extends `GSDataSource`, `EventSource` extends `GSDataSourceAsEventSource`. `EventSource` gets the DataSource's `this.client` automatically. Export both with `SourceType = 'BOTH'`.

---

## Core Imports from `@godspeedsystems/core`

```ts
import {
  GSContext,                  // request context, childLogger, etc.
  GSDataSource,               // base for DS
  GSEventSource,              // base for ES
  GSDataSourceAsEventSource,  // base for DS+ES EventSource half
  GSCachingDataSource,        // base for caching DSes (Redis)
  GSStatus,                   // (success, httpCode, message?, data?, headers?)
  GSCloudEvent,               // event wrapper for ES
  GSActor,                    // actor identity in events
  PlainObject,                // Record<string, any>
  logger,                     // pino logger
} from "@godspeedsystems/core";
```

`GSStatus(success: boolean, code: number, message?, data?, headers?)` — always return this from `execute()`, never throw to callers.

---

## Naming Conventions

- **Directory**: `plugins/<service>-as-datasource` / `...-as-eventsource` / `...-as-datasource-as-eventsource`
- **npm package**: `@godspeedsystems/plugins-<directory-name>`
- **`Type`**: short lowercase identifier for the loader (e.g. `'axios'`, `'cron'`, `'kafka'`)
- **`CONFIG_FILE_NAME`**: the YAML config file name users create in their project (e.g. `'api'` → `src/datasources/api.yaml`)

---

## Creating a New Plugin

### Option A — Generator (recommended for bootstrapping)

```bash
npm install -g generator-godspeed-plugin yo
yo godspeed-plugin
# prompts: plugin name, type (DataSource / EventSource / DataSource-As-EventSource)
```

### Option B — Manual (copy an existing plugin)

1. Copy the closest existing plugin directory as a template.
2. Update `package.json`: name, version (`1.0.0`), description, dependencies.
3. Rewrite `src/index.ts` — keep the required exports pattern.
4. Update `tsconfig.json` if needed (standard config is shared across all plugins).
5. Write `README.md` with config schema and usage examples.

### tsconfig.json (standard — same for all plugins)

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["es2016"],
    "strict": true,
    "allowJs": true,
    "declaration": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "exclude": ["./node_modules", "./dist"]
}
```

### Build & Test Locally

```bash
cd plugins/<name>
npm install
npm run build        # tsc → dist/
```

---

## CI/CD — Publishing

- **Trigger**: push to `main`
- **Workflow**: `.github/workflows/publish.yml`
- **Logic**: iterates `plugins/*/`, checks if `<name>@<version>` already exists on npm — skips if yes, publishes if no
- **To publish a new version**: bump `version` in `plugins/<name>/package.json` and push to main

---

## Code Style

- **Prettier**: 2-space indent, 100-char line width, double quotes, trailing commas, semicolons
- **ESLint**: TypeScript strict rules via `typescript-eslint`
- **Husky + lint-staged**: runs prettier + eslint on staged `.ts/.js` files before commit
- No comments unless the WHY is non-obvious. No multi-line docstrings.

---

## Existing Plugins Reference

| Plugin | Type | Notable Pattern |
|--------|------|-----------------|
| `axios-as-datasource` | DS | Token refresh, retry, security schemes |
| `express-as-http` | ES | JWT/OAuth2, metrics, file upload |
| `cron-as-eventsource` | ES | Minimal — good template for simple ES |
| `kafka-as-datasource-as-eventsource` | BOTH | Best template for DS+ES |
| `prisma-as-datastore` | DS | Field encryption, authorization filters |
| `redis-as-datasource` | DS | Extends `GSCachingDataSource` (not `GSDataSource`) |
| `socket-as-datasource-as-eventsource` | BOTH | JWT auth, Zod schema validation, heartbeat |

---

## Key Constraints

- Each plugin is fully self-contained — no shared runtime code between plugins.
- The single source of truth for a plugin is `src/index.ts` — do not split across multiple files unless the plugin is very complex (e.g. express).
- `dist/` is what gets published to npm; `src/` is excluded via `.npmignore`.
- `@godspeedsystems/core` version is a peer dependency pattern — pin to `^2.x.x` matching current plugins.
