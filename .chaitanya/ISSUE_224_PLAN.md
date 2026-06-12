# Issue #224 Implementation Plan — "Hello World"

## Summary

Add a simple TypeScript utility function `helloWorld` that returns the string
`"Hello, World!"`. The function must live at `src/utils/hello.ts` (repo root,
**not** inside any plugin sub-folder) and be exported as a named export so it
can be imported by other modules.

Because the repository is a monorepo of independent Godspeed plugins with no
existing root-level TypeScript configuration, this implementation also requires
a minimal `tsconfig.json` and `package.json` at the repository root so the new
`src/` tree compiles.

---

## Files to Create / Files to Modify

### Files to Create

| Path | Purpose |
|------|---------|
| `src/utils/hello.ts` | Implementation — exports `helloWorld` |
| `tsconfig.json` *(repo root)* | TypeScript compiler config for root-level `src/` |
| `package.json` *(repo root)* | NPM package config; adds `typescript` and `@types/node` as dev deps; defines `build` script |

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

   Keep it minimal; mirror the plugin convention (`main` → `dist/`, typescript
   for build):

   ```jsonc
   {
     "name": "godspeed-plugins-root",
     "version": "0.0.1",
     "private": true,
     "main": "dist/index.js",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
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

4. **Update `.gitignore` (repo root).**

   Check whether `/dist` and `/node_modules` lines are already present in the
   file; if not, append them:

   ```
   /dist
   /node_modules
   ```

5. **Install dependencies and verify.**

   ```bash
   npm install          # installs devDependencies from root package.json
   npm run build        # tsc — should emit dist/utils/hello.js with no errors
   ```

---

## Validation Checklist

- [ ] `src/utils/hello.ts` exists and contains a **named** export `helloWorld`
- [ ] `helloWorld()` returns exactly `"Hello, World!"` (capital H, capital W, comma after Hello, exclamation mark — verify character-by-character if needed)
- [ ] TypeScript compiles with `tsc --strict` — zero errors, zero warnings
- [ ] `dist/utils/hello.js` and `dist/utils/hello.d.ts` are emitted correctly after `npm run build`
- [ ] Function signature is `helloWorld(): string` — no parameters accepted
- [ ] No default export present (only named export, consistent with plugin convention)
- [ ] `.gitignore` has `/dist` and `/node_modules` entries so compiled output is not tracked
- [ ] No changes made to any existing plugin sub-folder
