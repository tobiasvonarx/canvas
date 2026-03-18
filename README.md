<p align="center">
  <img src="https://raw.githubusercontent.com/tobiasvonarx/canvas/main/static/canvas_logo_transparent.png" alt="Canvas" width="120" />
</p>

<h1 align="center">Canvas</h1>

<p align="center">
  <strong>Your thoughts, one infinite surface.</strong>
</p>

<p align="center">
  <a href="#getting-started">Get Started</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#widgets">Widgets</a> &bull;
  <a href="#philosophy">Philosophy</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

---

Everything is all over the place. Tabs, apps, bookmarks, notes scattered across twelve tools. Your brain doesn't work in folders and databases. It works in spaces.

**Canvas** is a free, open-source infinite canvas that lives on your computer. Drop notes, todos, RSS feeds, timers, weather, and anything else onto a single surface. Drag them around. Zoom in, zoom out. Make it yours.

> *"Organize your thoughts. Or don't. It's your canvas."*

## Features

- **Infinite canvas** - Drag anything onto it. Pan, zoom, scatter things around. A temporary dump for your brain that welcomes messy thoughts and half-formed ideas.
- **Notes** - Quick sticky notes with color options. Double-click to edit.
- **Todo lists** - Click-to-toggle task lists. Simple, no overhead.
- **RSS feeds** - Follow your favorite sources directly on your canvas.
- **Pomodoro timer** - Built-in focus timer with work/break cycles.
- **Weather** - Glanceable weather for any location.
- **Clock** - Simple, clean.
- **AI chat (optional)** - Bring your own OpenRouter or OpenAI key to chat with your canvas. Create widgets, modify existing ones, or ask questions from the sidebar. Fully opt-in. Canvas works great without it.
- **Multi-select** - Select multiple items, move them together, delete in bulk.
- **Keyboard shortcuts** - `Cmd+A` select all, `Delete` to remove, `Escape` to deselect.
- **Works offline** - No server, no connection needed. Boots instantly and runs entirely in your browser.

## Widgets

Canvas has a growing widget system. Current built-in widgets:

| Widget | Description |
|--------|-------------|
| Clock | Current time display |
| RSS Feed | Subscribe to any RSS/Atom feed |
| Pomodoro | Focus timer with configurable intervals |
| Weather | Live weather for any city |
| Lunch Menu | Fetches daily menu from any canteen page URL |

**Want more?** Build your own. Widgets are Svelte components. Register them in `src/lib/widgets/index.ts` and they appear in the toolbar. We're building toward a community widget marketplace - bring your ideas.

## Philosophy

### Why local-first?

Canvas stores everything on your machine using IndexedDB. No accounts, no cloud sync, no servers reading your thoughts.

This is intentional. Your personal workspace is *personal*. It should boot instantly, work offline, and never go down because a startup ran out of funding. Your data doesn't leave your browser. There's nothing to breach because there's nothing to access. The optional AI chat feature uses your own API key and communicates directly with the provider. Canvas never sees or stores your conversations on any server.

### Why not cross-device sync?

Canvas is an unstructured workspace. Things live where you put them - scattered, overlapping, clustered in ways that only make sense to you in the moment. This kind of spatial, free-form thinking doesn't translate well across devices with different screen sizes, input methods, and contexts. A canvas that looks right on your 27-inch monitor becomes unusable on a phone. Rather than force a broken experience, Canvas embraces single-device simplicity: zero config, zero conflicts, zero latency. Your desk at home doesn't sync with your desk at work, and that's fine. Some tools are better as *places* than as *services*.

## Getting Started

```sh
# Clone the repository
git clone https://github.com/tobiasvonarx/canvas.git
cd canvas

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and start placing things.

### Build for production

```sh
pnpm build
pnpm preview
```

## Tech Stack

- [SvelteKit](https://svelte.dev) + [Svelte 5](https://svelte.dev/docs/svelte/overview) (runes)
- [Dexie](https://dexie.org) (IndexedDB wrapper)
- [Vite](https://vite.dev)
- TypeScript

## Contributing

Canvas is community-driven. Whether it's a new widget, a bug fix, a performance improvement, or a wild idea - contributions are welcome.

1. Fork the repo
2. Create a branch (`git checkout -b my-widget`)
3. Commit your changes
4. Open a pull request

Please keep PRs focused and small when possible.

## License

MIT

---

<p align="center">
  <sub>Built with care by <a href="https://github.com/tobiasvonarx">Tobias von Arx</a> and the open-source community.</sub>
</p>
