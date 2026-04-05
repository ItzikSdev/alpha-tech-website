<!-- Workspace-level Copilot instructions for contributors and AI agents -->
# Alpha Tech Workspace - Copilot Instructions

Purpose: provide quick, link-first guidance for local setup, common commands, and critical conventions so AI assistants and contributors get productive fast.

## Quick Start
- Install dependencies:

  npm install

- Run development server (website):

  npm run dev

- Build production bundle:

  npm run build

- Run tests (website):

  npm run test

## Projects in this repository
- `alpha-tech-website` — React + Vite frontend (marketing + in-app UI)
- `AlphaCar/backend` — Node.js + Express + MongoDB backend
- `AlphaCar/mobile` — React Native + Expo mobile app
- `AlphaCar/alpha-ai` — Python FastAPI AI/validation service

## Important Links (read these first)
- Implementation rules & guidelines: [AlphaCar/CLAUDE.md](AlphaCar/CLAUDE.md)
- Backend overview & endpoints: [AlphaCar/API_ENDPOINTS.md](AlphaCar/API_ENDPOINTS.md)
- Database schema: [AlphaCar/DATABASE_SCHEMA.md](AlphaCar/DATABASE_SCHEMA.md)
- Setup checklist: [AlphaCar/PHASE_1_SETUP.md](AlphaCar/PHASE_1_SETUP.md)
- Workspace file index: [AlphaCar/SETUP_FILES_INDEX.md](AlphaCar/SETUP_FILES_INDEX.md)

## Key Conventions (short)
- Logging: follow 3-tier logging conventions (user_actions, socket_events, validation_logs). See CLAUDE.md.
- Auth: Google + Apple OAuth primary; email fallback. Don't store JWT in insecure storage for mobile—use SecureStore.
- Tests: frontend uses `vitest` (jsdom). Backend uses `jest` (see backend package.json).
- i18n: translations live in `src/i18n` (website + mobile). Preserve keys when editing.

## Commands (alpha-tech-website package.json)
- `dev` — vite dev server
- `build` — `tsc -b && vite build`
- `preview` — vite preview
- `test` — `vitest run`
- `test:watch` — `vitest`
- `test:coverage` — `vitest run --coverage`

## What to include in AI or PR prompts
- Task-specific context: project name (`alpha-tech-website`, `backend`, or `mobile`) and target environment (dev/build/test).
- Link to relevant docs (use the links above) rather than pasting long docs.
- For backend changes, include `.env` keys required (do not paste secrets).

## Where to look for more details
- Architecture & technical workflows: [AlphaCar/TECHNICAL_WORKFLOWS.md](AlphaCar/TECHNICAL_WORKFLOWS.md)
- Current status & roadmap: [AlphaCar/BACKEND_STATUS.md](AlphaCar/BACKEND_STATUS.md)
- Mobile UI guidelines: [AlphaCar/mobile/README-UI-GUIDELINES.md](AlphaCar/mobile/README-UI-GUIDELINES.md)

---
If you'd like, I can:
- run the website tests now (`npm run test` in `alpha-tech-website`),
- commit this file and open a PR,
- or extend the instructions with applyTo rules for per-folder agent behaviors.
