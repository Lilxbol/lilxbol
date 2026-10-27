<p align="center">
  <img alt="Lilxbol logo" src="media/linuxIcons/256x256.png">
</p>

<h1 align="center">Lilxbol</h1>

<p align="center"><i>A science-fiction terminal emulator with real system panels. A community fork of the beloved eDEX-UI, kept alive and rebuilt.</i></p>

---

## What is Lilxbol

Lilxbol is a fullscreen, sci-fi styled terminal and system monitor. It looks
like the bridge of a starship and works like a real terminal:

- A real shell (bash, PowerShell) in an xterm.js terminal with tabs
- Live system panels: CPU per-thread, RAM, disks, running processes
- **Music player panel** that scans a folder of your choosing for audio files
  (mp3, wav, ogg, flac, m4a, aac, opus) and plays them with a full mini-player
- On-screen keyboard with sound feedback for touch devices
- File browser with built-in media/PDF/text viewer
- Fuzzy file search, theme engine, remappable shortcuts

## Download

Grab an installer from the [Releases](../../releases) page, or build from
source (see below).

## Build from source

```bash
npm install
cd src && npm install && cd ..
npm run prebuild-linux
npx electron-builder build -l --x64     # Linux AppImage
npx electron-builder build -w --x64     # Windows installer (needs wine on Linux)
```

Note: `node-pty` must be built against Electron headers; on modern toolchains
install `node-gyp@10` inside `src/` and run:

```bash
cd src/node_modules/node-pty
../../node_modules/.bin/node-gyp rebuild --target=12.2.2 \
  --dist-url=https://www.electronjs.org/headers --runtime=electron
```

## Themes

Lilxbol ships with a custom violet/gold theme (`lilxbol`) as the default.
Drop any eDEX-UI theme JSON into the app's `themes` folder and it works.

## History and credits

Lilxbol is a fork of [eDEX-UI](https://github.com/GitSquared/edex-ui) by
Gabriel "Squared" Saillard, which was archived in October 2021. All credit for
the original concept, design, and engineering belongs to the original author
and its contributors. This fork rebrands the project, refreshes it with new
features (music player, updated theming), and keeps it buildable on modern
toolchains.

## License

[GPL-3.0](LICENSE) - free and open source for everyone. If you redistribute
modified versions, keep them open source under the same license.
