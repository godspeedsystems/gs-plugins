# Issue #224 Implementation Plan — "Hello World"

## Summary

Add a simple TypeScript utility function `helloWorld` that returns the string
`"Hello, World!"`. The function must live at `src/utils/hello.ts` (repo root,
**not** inside any plugin sub-folder) and be exported as a named export so it
can be imported by other modules.

Because the repository is a monorepo of independent Godspeed plugins with no
existing root-level TypeScript configuration, this implementation also requires
a minimal `tsconfig.json` and `package.json` at the repository root so the new
`src/` tree compiles and (optionally) tests can be run.

---

## Files to Create / Files to Modify

### Files to Create

| Path | Purpose |
|------|---------|
| `src/utils/hello.ts` | Implementation — exports `helloWorld` |
| `src/utils/hello.test.ts` | Unit tests (Mocha + Node.js `assert`) |
| `tsconfig.json` *(repo root)* | TypeScript compiler config for root-level `src/` |
| `package.json` *(repo root)* | NPM package config; adds `typescript`, `mocha`, `@types/mocha`, `@types/node` as dev deps; defines `build` and `test` scripts |

### Files to Modify

| Path | Change |
|------|--------|
| `.gitignore` | Append `/dist` and `/node_modules` entries if not already present (avoids accidentally committing compiled output) |

---

## Implementation Steps

1. **Create `tsconfig.json` at the repository root.**

   Match the pattern used in every plugin in this monorepo:

   ```jsonc
   {
     "compilerOptions": {
       "target": "es6",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "declaration": true,
       "moduleResolution": "node",
       "sourceMap": true,
       "esModuleInterop": true
     },
     "exclude": ["./node_modules", "./dist"]
   }
   ```

2. **Create `package.json` at the repository root.**

   Keep it minimal; mirror the plugin convention (`main` → `dist/`, mocha for
   tests, typescript for build):

   ```jsonc
   {
     "name": "godspeed-plugins-root",
     "version": "0.0.1",
     "private": true,
     "main": "dist/index.js",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "test": "mocha --require ts-node/register 'src/**/*.test.ts'"
     },
     "devDependencies": {
       "@types/mocha": "^10.0.0",
       "@types/node": "^20.0.0",
       "mocha": "^10.0.0",
       "ts-node": "^10.9.0",
       "typescript": "^5.0.0"
     }
   }
   ```

3. **Create `src/utils/hello.ts`.**

   ```typescript
   /**
    * Returns the canonical "Hello, World!" greeting string.
    */
   export function helloWorld(): string {
     return "Hello, World!";
   }
   ```

   Rules to follow:
   - Named export (`export function …`), **not** a default export.
   - Return type explicitly annotated as `string` (required by `strict: true`).
   - No external dependencies; pure function.

4. **Create `src/utils/hello.test.ts`.**

   See Test Cases section below for the full file content.

5. **Update `.gitignore` (repo root).**

   Check whether `/dist` and `/node_modules` lines are already present in the
   file; if not, append them:

   ```
   /dist
   /node_modules
   ```

6. **Install dependencies and verify.**

   ```bash
   npm install          # installs devDependencies from root package.json
   npm run build        # tsc — should emit dist/utils/hello.js with no errors
   npm test             # mocha — all tests should pass
   ```

---

## Test Cases

Full contents of `src/utils/hello.test.ts`:

```typescript
import assert from "node:assert/strict";
import { helloWorld } from "./hello";

describe("helloWorld", () => {
  // Happy path ----------------------------------------------------------------
  it("returns the exact string 'Hello, World!'", () => {
    assert.strictEqual(helloWorld(), "Hello, World!");
  });

  // Return-type contract -------------------------------------------------------
  it("returns a string, not null/undefined/number", () => {
    const result = helloWorld();
    assert.strictEqual(typeof result, "string");
  });

  // Idempotency ----------------------------------------------------------------
  it("returns the same value on repeated calls", () => {
    assert.strictEqual(helloWorld(), helloWorld());
  });

  // No side effects (calling does not throw) -----------------------------------
  it("does not throw", () => {
    assert.doesNotThrow(() => helloWorld());
  });
});
```

### Test matrix

| # | Case | Input | Expected |
|---|------|-------|----------|
| 1 | Happy path | `helloWorld()` | `"Hello, World!"` (exact, including comma and exclamation) |
| 2 | Return type | `typeof helloWorld()` | `"string"` |
| 3 | Idempotency | Call twice | Both calls return identical value |
| 4 | No throw | Wrapped in `doesNotThrow` | Does not throw |

---

## Validation Checklist

- [ ] `src/utils/hello.ts` exists and contains a **named** export `helloWorld`
- [ ] `helloWorld()` returns exactly `"Hello, World!"` (capital H, capital W, comma after Hello, exclamation mark — verify character-by-character if needed)
- [ ] TypeScript compiles with `tsc --strict` — zero errors, zero warnings
- [ ] `dist/utils/hello.js` and `dist/utils/hello.d.ts` are emitted correctly after `npm run build`
- [ ] All four Mocha test cases pass (`npm test`)
- [ ] Function signature is `helloWorld(): string` — no parameters accepted
- [ ] No default export present (only named export, consistent with plugin convention)
- [ ] `.gitignore` has `/dist` and `/node_modules` entries so compiled output is not tracked
- [ ] No changes made to any existing plugin sub-folder
