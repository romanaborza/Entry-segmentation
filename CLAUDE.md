# Shoptet Registrace – Project Guide

## Project overview

Multi-step registration flow prototype for Shoptet (Czech e-commerce platform). Built as a self-contained HTML/CSS/JS file with no build step or framework. The primary deliverable is `index.html`.

## Tech stack

- **Vanilla HTML/CSS/JS** — no framework, no bundler
- **Playwright** — end-to-end tests for all user flows
- **Node.js** — required only for running Playwright

## Running locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Testing

**Tests must pass before every commit and before reporting any task as done.**

### Setup (first time)

Install Node.js if not present: https://nodejs.org (LTS version)

```bash
npm init -y
npm install --save-dev @playwright/test
npx playwright install chromium
```

Playwright config is in `playwright.config.js` — it auto-starts the local server before running tests, so no need to start it manually.

### Run tests

```bash
npx playwright test
```

### Run tests with UI

```bash
npx playwright test --ui
```

### Test file location

`tests/flows.spec.js`

## User flows under test

Every navigation path must have a passing Playwright test:

| Flow | Path |
|---|---|
| Newcomer | S1 → S4 → S5 → S9 |
| Migration | S1 → S2 → S4 → S5 → S9 |
| Partner | S1 → S8 → S4 → S5 → S9 |
| Testing | S1 → S4 → S5 → S9 |
| Existing customer | S1 → S3 → S4 → S5 → S9 |
| Other (Jiné) | S1 → S4 → S5 → S9 |

Each flow test must verify:
- Correct screen transitions (forward and back)
- Validation errors appear when required fields are empty
- Validation errors clear when a valid value is entered
- Loader screen (S9) is reached at the end of the flow

## Code conventions

- All copy is in Czech — do not translate or change wording without explicit instruction
- Screen IDs follow the pattern `s1`, `s2` … `s9`
- Navigation functions are named `nextFromSN()` / `backFromSN()` for screens with conditional routing; static `goTo('sN')` for unconditional jumps
- Do not add external dependencies to `index.html` beyond the Google Fonts import already present
- The `__bundler_thumbnail` template tag must not be present in the output file — strip it whenever it appears

## Before pushing

1. Run `npx playwright test` — all tests must pass
2. Open `http://localhost:8080` and manually walk at least one full flow end-to-end
3. `git push` only after both steps succeed
