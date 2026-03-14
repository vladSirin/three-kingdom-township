# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

This is a pure-frontend static web app with no build step. Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

No package manager, bundler, linter, or test framework is configured.

## Architecture Overview

Four JS modules plus HTML/CSS — no framework, no imports:

| File | Responsibility |
|------|---------------|
| `game.js` | Game state, resource system, building system, turn resolution, game-over logic |
| `events.js` | All event card definitions, condition predicates, outcome effects, dynamic pool management |
| `ui.js` | DOM rendering, resource bar updates, event card display, sound (Web Audio API), toast/danmaku notifications |
| `town.js` | Building metadata and ambient dialogue |

All modules share a single global `gameState` object defined in `game.js`. There are no ES modules (`import`/`export`) — everything is loaded via `<script>` tags in `index.html` and communicates through globals.

## Key Systems

**Resource system:** 5 resources (Morale, Food, Military, Wealth, Reputation). Food/Military/Wealth have dynamic caps driven by building levels (`food_cap = 40 + granary_level × 20`, etc.). Morale and Reputation are fixed 0–100.

**Turn loop:** Player resolves one event card per turn (3 choices: conservative / balanced / risky) → seasonal production/consumption runs → active states update → game-over check → next event drawn.

**Event cards** (`events.js`): Each card has `condition()`, `weight`, and three `choices`, each with `effect()` and `outcome` text. Events enable/disable dynamically based on resource ratios, building levels, active states, and alignment.

**Alignment spectrum:** -100 (Tyrant) to +100 (Benevolent). Controls which exclusive event cards are available and applies stat modifiers.

**Active states** (e.g., `starving`, `fat_sheep`, `shoddy_work`): Temporary flags with duration counters that enable crisis events and apply modifier effects.

**Soft game-over:** When a resource hits 0 or 100, the town enters a 3-turn crisis with escalating penalties. Recovery within 3 turns averts permanent game over.

**PDX-style effect modifiers** on `gameState`: `food_production_mult`, `pop_growth_flat`, `morale_change_flat`, etc. Applied cumulatively by active states, alignment, buildings, and event outcomes.

## Documentation

- `system_values.md` — hidden game parameters, resource formulas, building upgrade tables
- `docs/system_design.md` — full system spec: all events, alignment tiers, state machine
- `docs/design_phase1.md` — Phase 1 implementation notes and UI/UX decisions
- `docs/roadmap.md` — phased development plan (Phase 2 currently active)
