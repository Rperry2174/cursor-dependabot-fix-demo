# cursor-dependabot-fix-demo

**Intentional Dependabot / Cursor cloud-agent demo.** This repo ships with **outdated dependencies on purpose** so Dependabot-shaped PRs break CI until application code is updated.

> Warning: Do not use these pinned versions in production. They are outdated for demo debt only.

## What this is

A tiny **KickVault** marketplace inventory/orders Express + TypeScript microservice. Main is green on old majors. Bumping packages like `zod`, `express`, `uuid`, `node-fetch`, `chalk`, or `glob` without code changes turns CI red — which is the point.

## Quick start

```bash
npm ci
npm test
npm run build
```

Expected local/CI time: well under ~2 minutes.

## Demo flow

1. Open a red dependency-bump PR (or wait for Dependabot).
2. Point a Cursor cloud agent at the PR.
3. Agent updates call sites / imports for the new major and restores green CI.

## Enable Dependabot

If alerts/updates are not already on:

1. Repo **Settings → Code security and analysis**
2. Enable **Dependabot alerts**, **Dependabot security updates**, and **Dependabot version updates** (this repo already has `.github/dependabot.yml`).

## Intentionally outdated packages

Pinned exact versions (no `^`) of popular packages whose major upgrades commonly need code fixes: `express`, `zod`, `uuid`, `node-fetch`, `chalk`, `axios`, `glob`, `lodash`, `moment`, `qs`, plus older `jest` / `typescript` toolchains.


## GitHub Actions CI

The workflow file intended for this demo is checked in as [`.github/ci.workflow.yml`](.github/ci.workflow.yml) (same content as `.github/workflows/ci.yml`).

The bootstrap OAuth token lacked the `workflow` scope, so GitHub rejected pushes that create `.github/workflows/*`. To enable CI:

```bash
gh auth refresh -h github.com -s workflow
mkdir -p .github/workflows
cp .github/ci.workflow.yml .github/workflows/ci.yml
git add .github/workflows/ci.yml && git commit -m "ci: enable GitHub Actions" && git push
```

Until then, validate locally with `npm ci && npm test && npm run build`.
