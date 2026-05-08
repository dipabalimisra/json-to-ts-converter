# JSON → TypeScript Types Converter

> Paste any JSON object or array — get clean, typed TypeScript interfaces instantly. Live conversion as you type.

![Demo](./demo.gif)

<!-- Replace demo.gif with your own screen recording or screenshot -->

---

## What It Does

Converts raw JSON (from API responses, mock data, logs, etc.) into ready-to-use TypeScript `interface` declarations — instantly, in the browser, with no backend.

Handles nested objects, arrays of objects, `null` values, mixed arrays, and quoted keys automatically.

---

## Why I Built It

Every time I got a new API response payload, I ended up manually writing TypeScript interfaces for it — copy the key, figure out the type, repeat 20 times. This tool eliminates that entirely. Paste once, copy the generated types, move on.

---

## Tech Stack

| Layer     | Tech                                    |
| --------- | --------------------------------------- |
| Framework | React 18 (TypeScript template)          |
| Language  | TypeScript                              |
| Styling   | Vanilla CSS (dark theme, no UI library) |
| Clipboard | Native Web Clipboard API                |
| Build     | Create React App                        |
| Deploy    | GitHub Pages (`gh-pages`)               |

No external UI libraries. No backend. Runs entirely in the browser.

---

## Features

- **Live conversion** — updates as you type (150ms debounce)
- **Nested interfaces** — deeply nested objects get their own named interfaces
- **Array support** — typed arrays (`string[]`, `User[]`) and mixed arrays (`unknown[]`)
- **Null handling** — `null` values typed as `null` (not `any`)
- **Custom root name** — configure the top-level interface name
- **Copy to clipboard** — one-click copy with visual feedback
- **Clear button** — wipe input cleanly
- **Error messages** — graceful invalid-JSON feedback, no crashes
- **Mobile-responsive** — panels stack vertically on small screens

---

## How to Run

### Prerequisites

- Node.js v16+ and npm

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/dipabalimisra/json-to-ts-converter.git
cd json-to-ts-converter

# 2. Install dependencies
npm install

# 3. Start dev server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

> Requires `homepage` set in `package.json` — see [Setup for Deploy](#setup-for-deploy) below.

---

## Setup for Deploy

Add the following to your `package.json`:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/json-to-ts-converter",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Then install `gh-pages`:

```bash
npm install --save-dev gh-pages
```

Run `npm run deploy` — your app will be live at the homepage URL.

---

## Project Structure

```
json-to-ts-converter/
├── public/
│   └── index.html
├── src/
│   ├── utils/
│   │   └── jsonToTs.ts      ← core conversion logic (no React, pure TS)
│   ├── App.tsx              ← two-panel UI
│   ├── App.css              ← dark theme styles
│   └── index.tsx
├── .gitignore
├── package.json
└── README.md
```

---

## Edge Cases Handled

| Input                        | Output                               |
| ---------------------------- | ------------------------------------ |
| `{ "val": null }`            | `val: null`                          |
| `[{ "id": 1 }, { "id": 2 }]` | `type RootObject = RootObjectItem[]` |
| `[1, "hello", true]`         | `unknown[]`                          |
| `{}`                         | Empty interface                      |
| `"just a string"`            | `type RootObject = string`           |
| Invalid JSON                 | Error message in status bar          |

---

## AI Tools Used

- **Claude (claude.ai)** — primary code generation, debugging, README
- **GitHub Copilot** — inline suggestions during edits

---

## What AI Got Right

1. **Recursive conversion logic** — the `inferType` / `inferObjectType` recursion was clean and correct on the first generation, handling arbitrary nesting depth without issues.
2. **React hooks pattern** — the `useEffect` with a debounce timer and cleanup (`clearTimeout`) was idiomatic and correct out of the box.
3. **CSS dark theme layout** — the two-panel flex layout with header, scrollable editor, and sticky footer was generated correctly and required almost no tweaking.

---

## What I Had to Fix

1. **Null typing** — AI initially typed `null` JSON values as `any`. I caught this during manual edge-case testing and prompted a targeted fix to use `null` as the explicit TypeScript type. The fix required one follow-up prompt.

2. **Interface ordering** — The first version put nested interfaces _after_ the root interface, which means TypeScript's `interface` hoisting doesn't matter, but it still looked backwards when reading the output. I revised the logic to always put the root interface at the top and nested interfaces below it.

3. **Array of objects typing** — When a JSON array contained objects (e.g. `[{ "id": 1 }]`), the first version typed it as `object[]` instead of generating a named interface (`RootObjectItem[]`). I had to iterate on the prompt twice and ultimately write the `inferArrayType` function myself to get named interface generation for arrays of objects.

---

---

## Screenshots / Demo

<img width="1358" height="388" alt="image" src="https://github.com/user-attachments/assets/db8474b9-b974-4131-b6b0-ad5f1123ad51" />


---

## Live Demo

[https://dipabalimisra.github.io/json-to-ts-converter](https://dipabalimisra.github.io/json-to-ts-converter)

---

## License

MIT
