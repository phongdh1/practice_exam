# Repository Guidelines

## Project Structure

- `apps/web` and `apps/admin` are Next.js apps for candidates and administrators. App Router pages and route handlers live in each app's `src/app`.
- `apps/api/src` contains NestJS feature modules. The Prisma schema, migrations, and seed script live in `apps/api/prisma`.
- `apps/zalo-mini-app/src` contains the Vite-based Zalo client. Shared UI, API clients, types, utilities, and tooling live in `packages/`. Design references and mockups live in `_bmad-output/`.

## Build, Test, and Development

Use Node.js 20 or newer and pnpm 8.15.9. Run these commands from the repository root.

- `pnpm install` installs workspace dependencies and generates the Prisma client.
- `pnpm dev` starts the workspace dev servers. The candidate web app uses port 3000 and the admin app uses 3002. Run `pnpm --filter @practice-exam/web dev` to start just the web app.
- `pnpm build` builds the apps and shared packages. `pnpm lint` runs ESLint, and `pnpm typecheck` checks TypeScript without emitting files.
- `pnpm test` runs the workspace test scripts through Turbo. Use `pnpm prisma:generate` after changing the Prisma schema.

Use `.env.example` to configure local environment variables. See `docs/DATABASE_URL.md` for PostgreSQL connection setup. Keep credentials in local environment files.

## Coding Style

Match the surrounding TypeScript and TSX style, including two-space indentation. Use kebab-case filenames, PascalCase React component and class names, and NestJS suffixes such as `.controller.ts` and `.service.ts`. Preserve Next.js route filenames such as `page.tsx` and `route.ts`. Reuse shared components and types from `packages/`.

## Testing

Place Jest API tests beside the code as `*.spec.ts` and Vitest tests in shared packages as `*.test.ts` or `*.test.tsx`. Run the API suite with `pnpm --filter @practice-exam/api test`. The API Jest configuration sets no minimum coverage threshold.

## Commits and Pull Requests

Follow the scoped commit format common in recent history, such as `fix(admin): show cover preview for external image URLs`. In pull requests, describe the change and how you verified it, link the related issue when available, and include screenshots for visible UI changes.
