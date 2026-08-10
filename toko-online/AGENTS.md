# AGENTS.md

This repository is the main storefront app for a Next.js 14 e-commerce site with Prisma, PostgreSQL, Xendit QRIS payments, and Google Sheet sync.

## Project conventions
- Work from this project directory unless a task clearly targets the sibling copy under the workspace.
- Use the existing npm scripts from [package.json](package.json) for local workflow: `npm run dev`, `npm run build`, `npm run lint`, `npm run seed`, and `npm run import:shopee`.
- Follow the setup and deployment notes in [README.md](README.md) before changing runtime behavior or integrations.
- Database changes belong in [prisma/schema.prisma](prisma/schema.prisma). If you change models, keep Prisma migrations and generated client updates consistent.
- Keep the app aligned with the Next.js App Router structure:
  - UI pages live under [src/app](src/app)
  - API routes live under [src/app/api](src/app/api)
  - Shared helpers live under [src/lib](src/lib)
  - Admin flows live under [src/app/admin](src/app/admin)
- Payment and webhook logic is centered in [src/lib/xendit.ts](src/lib/xendit.ts) and [src/app/api/webhooks/xendit/route.ts](src/app/api/webhooks/xendit/route.ts). Preserve the QRIS flow and webhook behavior when editing those areas.
- Google Sheet integration lives in [src/lib/googleSheet.ts](src/lib/googleSheet.ts) and [apps-script/WebIntegration.gs](apps-script/WebIntegration.gs). Keep secrets in environment variables rather than hardcoding them.

## Windows terminal notes
- This workspace is used from Windows, so prefer PowerShell-compatible commands and avoid shell-specific assumptions.
- If terminal startup or command execution hits ConPTY/PTY-related errors, retry in a fresh PowerShell terminal and keep commands simple; the Windows terminal setting for ConPTY should be enabled rather than relying on bash-only syntax.
- When editing or running commands, preserve the current TypeScript and Next.js conventions instead of introducing unrelated patterns.
