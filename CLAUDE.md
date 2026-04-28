# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ClaudeNextWatch is a Next.js application. The project is in early development — commands below assume a standard Next.js setup and should be updated once `package.json` exists.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # run ESLint
npm test           # run tests
npm test -- <file> # run a single test file
```

## Git & GitHub

All changes must be committed with clean, descriptive messages and pushed to GitHub (https://github.com/davale365/ClaudeNextWatch) regularly throughout work — not just at the end. Commit after each meaningful unit of work (new feature, bug fix, refactor, config change) so progress is never lost and the history is easy to follow. The main branch is `main`.

- Commit early and often — don't batch unrelated changes into one commit
- Each commit message should describe *what changed and why* in a concise subject line
- Always push after committing so the remote stays in sync
