# @practice-exam/api

NestJS API with Prisma and Supabase PostgreSQL.

## Prisma

Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`.

### Generate client

From the monorepo root (recommended):

```bash
pnpm prisma:generate
```

Or via the API package filter:

```bash
pnpm --filter @practice-exam/api prisma:generate
```

From this directory:

```bash
pnpm prisma:generate
```

### Windows: `EPERM` on `prisma generate`

If you see:

```text
EPERM: operation not permitted, rename ...query_engine-windows.dll.node.tmp... -> ...query_engine-windows.dll.node
```

the Prisma query engine DLL is locked by another process. Common causes:

1. **Dev server running** — `pnpm dev` or `pnpm --filter @practice-exam/api dev` loads `@prisma/client` and holds `query_engine-windows.dll.node`.
2. **`pnpm install` postinstall** — `apps/api` runs `prisma generate` on install; do not run generate manually at the same time.
3. **Antivirus** — real-time scanning of `node_modules` can block the rename.

**Fix:**

1. Stop all dev servers (`Ctrl+C` in terminals running `pnpm dev` or the API dev script).
2. Wait a few seconds for Node to exit.
3. Regenerate:

   ```bash
   pnpm prisma:generate
   ```

4. If it still fails, close other terminals/IDEs using the repo, then delete the stale client folder and retry:

   ```powershell
   Remove-Item -Recurse -Force "node_modules\.pnpm\@prisma+client@*\node_modules\.prisma\client" -ErrorAction SilentlyContinue
   pnpm prisma:generate
   ```

5. Restart dev: `pnpm dev`

Do **not** run `prisma generate` while the API is running on Windows.

### Other commands

```bash
pnpm --filter @practice-exam/api prisma:migrate   # migrate dev (needs .env)
pnpm --filter @practice-exam/api prisma:validate  # validate schema (uses .env.example)
```
