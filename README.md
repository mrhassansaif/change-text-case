# 🪄 ReactCase Wizard

> A modern text case converter and text utility — originally built in 2022, brought back and heavily revamped in 2026.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Netlify](https://img.shields.io/badge/Live-Netlify-00C7B7?logo=netlify&logoColor=white)](https://reactcasewizard.netlify.app/)

**🌐 Live Demo:** [https://reactcase-wizard.netlify.app//](https://reactcase-wizard.netlify.app/)

**🌐 Old Wizard:** [https://reactcasewizard.netlify.app/](https://reactcasewizard.netlify.app/)

Originally built in 2022, ReactCase Wizard returned in 2026 with a refreshed interface, expanded functionality, and a more polished developer-tool experience — while staying intentionally lightweight and fully client-side.

---

## ✨ What is ReactCase Wizard?

ReactCase Wizard is a browser-based text utility for transforming writing and developer-oriented text formats.

Type or paste text, pick a transformation, and get an instant result — no accounts, no backend, no waiting on a server.

You can:

- convert text between writing, developer, and fun case formats
- view live text statistics
- copy the result to the clipboard
- clear the editor
- download output as a `.txt` file
- undo and redo transformations
- keep the original text while previewing a transformed result
- run quick cleanup actions (whitespace, line breaks, sorting, and more)
- restore recent transformations from local history
- use keyboard shortcuts
- try a random **Surprise me** transformation
- insert sample text when the editor is empty

---

## 🕰️ The Story — From 2022 to 2026

It started as a small 2022 experiment. Apparently, I wasn't finished with it.

```text
2022
→ Original React + Vite text case converter
→ Simple editor, basic case buttons, word/character counts
→ Purple-gradient, student-project energy (we've all been there)

↓
Forgotten for a while

↓
2026
→ Project brought back instead of abandoned
→ Complete UI redesign (dark, minimal, developer-tool aesthetic)
→ Expanded writing + developer + fun case options
→ Richer statistics
→ Copy / Clear / Download
→ Undo / Redo
→ Original → Result mode
→ Quick text utilities
→ Recent transformations (localStorage)
→ Keyboard shortcuts
→ Responsive 2026-style UX
```

It survived its 2022 version and came back in 2026 with a new wardrobe — and a few more useful pockets.

---

## 🚀 What's New in the 2026 Revamp?

The 2026 work modernized the existing React + Vite project rather than replacing the stack or turning it into a backend app.

Highlights of the revamp:

- complete UI/UX refresh with a dark developer-tool look
- improved responsive behavior across phone and desktop widths
- expanded case transformations (writing, developer, and fun groups)
- better editor experience with sample text and clearer controls
- richer live statistics (including characters without spaces and sentences)
- polished copy feedback, clear action, and `.txt` download
- local undo / redo history for transformations and utilities
- **Transform in place** and **Keep original** editor modes
- quick text actions for cleanup and line operations
- recent transformations stored in `localStorage`
- keyboard shortcuts with a small discoverability popover
- **Surprise me** random case transformation
- improved accessibility (labels, tooltips, focus states, disabled states)
- cleaner code organization (`utils/`, `hooks/`, dedicated conversion helpers)

The app remains a lightweight, client-side utility.

---

## 🚀 Features

### Writing Cases

- `UPPERCASE`
- `lowercase`
- `Sentence case`
- `Title Case`
- `Capitalized Case`

### Developer Cases

- `camelCase`
- `PascalCase`
- `snake_case`
- `kebab-case`
- `CONSTANT_CASE`

### Fun Cases

- `aLtErNaTiNg`
- `InVeRsE cAsE`
- **Surprise me** — applies a random available case transformation

### Text Statistics

Shown live as you edit:

- Word count
- Character count
- Line count
- Characters excluding spaces *(via More)*
- Sentence count *(via More)*

### Productivity Features

- Copy to clipboard (with success / failure feedback)
- Clear editor
- Download as `reactcase-output.txt`
- Undo / Redo
- **Transform in place** mode (default)
- **Keep original** mode (editable original + read-only result)
- Recent transformations (collapsible, local only)
- Sample text (“Try sample”)
- Keyboard shortcuts popover

### Quick Actions

- Clean whitespace
- Remove line breaks
- Trim spaces
- Sort lines
- Remove duplicate lines
- Reverse lines

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + Shift + C` | Copy current output |
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` | Redo |
| `Ctrl/⌘ + Enter` | Reapply the last selected case |
| `Esc` | Clear the editor (when focused) |

---

## 🧠 How It Works

1. Enter or paste text into the editor.
2. Choose a case transformation or quick action.
3. ReactCase Wizard updates the text instantly in your browser.
4. Copy, download, undo, or keep transforming.

> Text transformation happens in your browser, so the application does not require a backend to process your text.

Recent items are stored in `localStorage` on your device. Active undo/redo history stays in memory for the current session.

---

## 🖥️ Preview

A current UI screenshot is not included in the repository yet.  
In the meantime, the best preview is the live app:

👉 [https://reactcase-wizard.netlify.app//](https://reactcase-wizard.netlify.app/)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI and application logic |
| Vite 5 | Development server and production builds |
| JavaScript (ES modules) | Case conversion, stats, and utilities |
| Material UI | Tooltips, popovers, and icons |
| Emotion | Styling support used by Material UI |
| Inter (`@fontsource/inter`) | UI typography |
| CSS | Layout, theme tokens, and responsive design |

No backend, database, or authentication layer.

---

## 📦 Getting Started

### Clone the repository

```bash
git clone https://github.com/mrhassansaif/change-text-case.git
cd change-text-case
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 📁 Project Structure

```text
src/
├── Components/
│   ├── TextChange.jsx      # Main editor UI and feature wiring
│   └── TextChange.css      # Component styles
├── hooks/
│   └── useTextHistory.js   # Local undo / redo history
├── utils/
│   ├── caseConverters.js   # Case transforms and case groups
│   ├── quickActions.js     # Cleanup / line utilities
│   ├── textStats.js        # Word, character, line, sentence stats
│   ├── recent.js           # localStorage recent items
│   ├── clipboard.js        # Clipboard helpers
│   └── downloadText.js     # Browser .txt download helper
├── App.jsx
├── App.css
├── main.jsx
└── index.css               # Global styles and design tokens
```

Conversion logic and helpers live in `utils/`; the UI stays centered in `TextChange.jsx`.

---

## 🌐 Live Demo

The deployed 2026 revamp is available here:

👉 **[https://reactcase-wizard.netlify.app//](https://reactcase-wizard.netlify.app/)**

Repository:

👉 **[https://github.com/mrhassansaif/change-text-case](https://github.com/mrhassansaif/change-text-case)**

---

## 🔮 Future Ideas

These are ideas, not promises:

- additional text utilities and case formats
- optional light theme (token structure is already in place) ✅ Done!
- clearer shortcut discoverability
- more developer-focused text tools
- a README screenshot of the current UI

---

## 👨‍💻 Author

**Hassan Saif**

- GitHub: [https://github.com/mrhassansaif](https://github.com/mrhassansaif)

---

## 📄 License

This repository currently has no specified license.
