The plan file has been written to `CHAITANYA_ISSUE_220_PLAN.md`. Here's a summary of what it covers:

---

## What the plan contains

**Problem:** Issue #220 asks for a `helloWorld` named export at `src/utils/hello.ts` returning `"Hello, World!"`. Simple function, but the repo has no root-level `src/` directory and no working test infrastructure — so scaffolding is the real work.

**Files to create (3):**
1. `src/utils/hello.ts` — the 3-line implementation
2. `src/utils/__tests__/hello.test.ts` — 4 Mocha + Chai test cases
3. `tsconfig.src.json` — root-level TypeScript config (matching the per-plugin pattern exactly)

**Files to modify (1):**
- Root `package.json` — adds `mocha`, `ts-mocha`, `chai`, `@types/*`, `typescript` to devDependencies, and `test`/`build:src` scripts

**Key findings from codebase exploration:**
- Zero test files exist anywhere in the repo today — this is the first
- The repo's `"type": "module"` in root `package.json` is called out as a caveat (ts-mocha bypasses it; compiled CommonJS output is flagged)
- Prettier rules, strict TypeScript settings, and exact compiler options are all drawn from existing plugins
- 4 concrete test cases documented with exact input/expected output