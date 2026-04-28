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

- Commit after completing any meaningful unit of work (feature, fix, or structural change)
- Use clear, professional commit messages in this format:

  `<type>: <short description>`

  Examples:
  - `feat: add TMDb search for titles`
  - `feat: implement confidence score v1 logic`
  - `fix: correct genre matching bug in scoring function`
  - `refactor: clean up recommendation service structure`
  - `chore: update environment variables and config`

- Push to GitHub after each commit
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
