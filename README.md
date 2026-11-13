# dbcu.verse ✧

A handmade, interactive birthday storybook: a night-sky intro, a cake you decorate and make a wish on, a personal planet to explore, a scrapbook playlist, and a hidden letter.

Built with React, TypeScript, Tailwind CSS and Framer Motion. Everything runs in the browser, with no backend.

## Personalise it

Everything personal lives in **`src/content.ts`**:

| What | Where in `content.ts` |
| --- | --- |
| Their name, your name, the date | `birthdayPersonName`, `senderName`, `birthdayDate` |
| Planet photo | `heroPhoto` |
| Photos in the letter + gallery + hanging polaroids | `sharedPhotos` (the first two go inside the letter) |
| The "memory star" photo and note | `memoryStar` |
| Songs (5–8) | `songs`: `title`, `artist`, `memory`, optional `lyrics`, `cover`, `link` |
| Notes between the songs | `songMemories` |
| The letter | `letterText.paragraphs` (each string is one paragraph) |
| Optional ambient audio file | `optionalAudio.src` (leave empty for the soft generated hum) |

Anything in `[SQUARE BRACKETS]` is a placeholder.

**Photos:** put files in `public/photos/` and reference them with `photo('file.jpg')`. They're shown exactly as they are: frames only crop them, and tapping one opens the full, uncropped image. Resize big camera files to about 1800px first so the page loads quickly on phones.

**Song covers:** add an image to `public/photos/` and set `cover: photo('cover.jpg')`. Without one, a hand-painted placeholder cover is drawn.

## Run it locally

```bash
npm install
npm run dev
```

## Publish on GitHub Pages

1. Create a new repository on GitHub and push this folder to the `main` branch.
2. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site on every push. The link appears under Settings → Pages, e.g. `https://<username>.github.io/<repo>/`.

> **Privacy note:** on a public repository or public Pages site, anyone with the link can see the photos and letter. The original full-resolution photos in the project root are git-ignored; only the resized copies in `public/photos/` are published.

## Small details

- Cake decorations and progress (wish made, letter opened) are saved in the browser's localStorage. A refresh keeps the cake.
- After the letter is closed for the first time, a new golden star appears in the universe.
- Respects "reduce motion", works with a keyboard (arrow keys move around the universe; Delete removes a selected cake decoration; Ctrl/⌘+Z undoes), and sound stays off until tapped.
