# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start the server (runs on http://localhost:3000)
npm start
# or directly:
node server.mjs
```

There are no tests or linting configured.

## Architecture

Deckmaker is a browser-based card design tool for tabletop games. The stack is intentionally minimal: an Express server serves a single-page vanilla JS application.

### Server (`server.mjs`)
- Express 5 with ES modules (`"type": "module"` in package.json)
- Serves `public/` as static files
- Serves `uploads/` at `/uploads/` so the frontend can reference uploaded images
- One API endpoint: `POST /api/upload` (via Multer) — accepts a single image, saves it to `uploads/` with a unique timestamped filename, returns `{ url: "/uploads/<filename>" }`

### Client (`public/`)
All logic lives in `public/app.js` (~2500 lines, vanilla JS, no framework or bundler).

**CSV Data Format** — cards are uploaded as CSV with these columns:
`Card_ID, Card_Type, Card_Title, Buoy_Mod, Standard_Text, Red_Filter_Text, Min_Pts, Bio_Pts, Mechanic_Action, Flavor_Text, Qty`

`Card_Type` drives category grouping. `Qty` controls how many copies of a card are rendered. See `mock_data.csv` for examples.

**Core state objects:**
- `parsedCsvData` — raw CSV rows after parsing
- `categoryStyles` — the central styling store, keyed by scope:
  - `"all"` — global defaults
  - `"cat_<Card_Type>"` — per-category overrides (e.g. `"cat_Upgrade"`)
  - `"card_<Card_Title>"` — per-card overrides (e.g. `"card_Experimental Chassis"`)

  Styles cascade in priority order: `all` < `cat_*` < `card_*`. Resolution happens in `getEffectiveStyles()`.

- `backsideMappings` — maps category names or individual card titles to a "backside" card title for print layout

**Persistence:**
- `localStorage["deckmaker_autosave"]` — auto-saved on every style change (deck data + styles + mappings)
- `localStorage["deckmaker_presets"]` — named style presets; can be exported/imported as JSON

**Key subsystems and their entry points:**
- CSV parsing: `parseCSV()`, card DOM generation: `generateCards()`
- Style application: `applyStoredStyles(cardDiv, category, title)` — writes CSS custom properties onto each card element
- Style controls: `simpleBindings` array declaratively maps UI controls to `categoryStyles` properties; `updateControlsToMatchCategory()` syncs UI to current selection
- Undo/redo: `undoStack` / `redoStack` (max 50 states); Ctrl+Z / Ctrl+Y
- Style copy/paste: Ctrl+C copies current target's styles; Ctrl+V pastes to current target
- Custom draggable text elements on cards: `handleAddCustomText()`, `attachCustomTextEvents()`
- Floating inline toolbar for custom text: `showCtxToolbar()` / `closeCtxEditor()`
- Accessibility checker: `updateAccessibilityChecker()` — live WCAG contrast ratio against a simulated 15%-darker print background
- Print layout: `generatePrintLayout()` — assembles cards paired with their backsides for browser print

**Targeting model:** `selectCardTarget(title)` switches the workspace to show only copies of a named card and updates the "Frontside Mapping" target selector to `card_<title>`, enabling per-card style overrides.
