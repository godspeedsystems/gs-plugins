The plan file has been written to `CHAITANYA_ISSUE_218_PLAN.md`. Here's what it covers and the key decisions made:

---

### Key Findings from Codebase Exploration

| Finding | Impact on Plan |
|---------|---------------|
| **No root `src/` directory** | Must be created from scratch |
| **No root `tsconfig.json`** | Must add one (needed by ts-jest); scoped to exclude `plugins/` |
| **Zero test files / no test framework** | Must set up Jest + ts-jest; documented as net-new infra |
| **Root `package.json` has `"type": "module"`** | Requires `--experimental-vm-modules` flag + ESM-aware ts-jest preset |
| **Plugin tsconfig pattern** | Root tsconfig mirrors plugin configs for consistency |

---

### What the Plan Contains

1. **4 files to create** — `src/utils/hello.ts`, its test file, `jest.config.js`, and a root `tsconfig.json`
2. **1 file to modify** — root `package.json` to add the `test` script + jest devDependencies
3. **Exact file contents** for every file — no guesswork for the implementer
4. **Gotcha documentation** — ESM/Jest compatibility, `.js` import extension for ESM resolution, why `--experimental-vm-modules` is needed
5. **3 concrete test cases** with expected inputs/outputs
6. **13-item validation checklist** covering correctness, formatting, test execution, and non-regression