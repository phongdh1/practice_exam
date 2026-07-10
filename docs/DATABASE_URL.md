# Database connection URLs (Supabase + Prisma)

The NestJS API reads `DATABASE_URL` and `DIRECT_URL` from the **monorepo root** `.env` file (`Practice_Exam/.env`). An optional fallback is `apps/api/.env` for any variables not set at the root.

## URL-encode your password

Supabase database passwords often contain characters that **must be percent-encoded** in a PostgreSQL connection URL. If they are left raw, Prisma fails at startup with:

```text
P1013: empty host in database URL
```

### Characters to encode

| Character | Encoded |
|-----------|---------|
| `@`       | `%40`   |
| `#`       | `%23`   |
| `!`       | `%21`   |
| `$`       | `%24`   |
| `%`       | `%25`   |
| `&`       | `%26`   |
| `=`       | `%3D`   |
| `?`       | `%3F`   |
| `/`       | `%2F`   |
| `:`       | `%3A`   |

### Example

If your Supabase password is `P@ss#w!rd`, use:

```text
P%40ss%23w%21rd
```

Full URL (placeholders — replace `[PROJECT_REF]` and encoded password):

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:P%40ss%23w%21rd@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:P%40ss%23w%21rd@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## Quick encode in Node.js

Run in a terminal (paste your password when prompted — it is not saved):

```bash
node -e "const readline=require('readline');const rl=readline.createInterface({input:process.stdin,output:process.stdout});rl.question('Password: ',p=>{console.log(encodeURIComponent(p));rl.close();})"
```

Copy the output into your `.env` URL in place of `[PASSWORD]`.

## Where to put `.env`

1. Copy `.env.example` → `Practice_Exam/.env` (recommended).
2. Optionally use `apps/api/.env` for local overrides; root values take precedence.

Never commit `.env` — it is gitignored.
