# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ClaudeNextWatch is a Next.js 16 application (App Router) built with TypeScript, Tailwind CSS v4, and shadcn/ui.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:3000)
npm run build        # production build
npm run lint         # run ESLint
npm test             # run tests
npm test -- <file>   # run a single test file
```

## Git & Version Control Rules

**Commit and push regularly throughout work — not just at the end of a task.** Every meaningful unit of progress must be saved to GitHub so work is never lost and can always be reverted to a known-good state.

Commit after each of these:
- A new file or service is created
- A feature or sub-feature is complete
- A bug is fixed
- Any structural or config change is made

Use clear, professional commit messages in this format:

  `<type>: <short description>`

  Examples:
  - `feat: add TMDb search for titles`
  - `feat: implement confidence score v1 logic`
  - `fix: correct genre matching bug in scoring function`
  - `refactor: clean up recommendation service structure`
  - `chore: update environment variables and config`

Hard rules:
- Push to GitHub immediately after every commit
- Do NOT bundle unrelated changes into one commit
- Do NOT leave uncommitted changes at the end of a task
- Always ensure the app builds successfully before committing

## Development Principles

- Keep code modular and readable
- Avoid overengineering (focus on MVP)
- Prefer simple deterministic logic over AI for core features
- Use TypeScript strictly (no `any` unless necessary)
- Separate logic (services) from UI components

## MVP Goal

The goal is to build a working version where:
- User inputs recent watches
- User selects mood/time/platforms
- App returns 3 recommendations with a confidence score

Do NOT add advanced features (AI, subscriptions, social, extensions) unless explicitly instructed.
