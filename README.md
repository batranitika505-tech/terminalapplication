# 🎵 Terminal Audio Player

A sleek, lightweight, interactive command-line music player for macOS, built with Node.js and native CoreAudio (`afplay`). Zero external dependencies required!

---

## ✨ Features

- 🖥️ **Interactive Terminal UI**: Real-time ANSI dashboard showing your playlist, active selection cursor, and playback status badges (`[▶ PLAYING]`, `[⏸ PAUSED]`).
- ⚡ **Zero Dependencies**: Powered purely by Node.js built-ins (`child_process`, `fs`, `path`) and macOS's native `afplay`.
- 🕹️ **Intuitive Controls**: Supports standard arrow keys, spacebar play/pause toggling, stop, and Vim keybindings (`j` / `k`).
- 🛡️ **Robust Process Management**: Prevents audio overlap, safely reclaims stopped/paused processes, and guarantees no background zombie processes on exit.
- 🧹 **Graceful Terminal Handling**: Cleanly intercepts `Ctrl+C` and exit signals, restoring raw terminal mode and cursor visibility.
- 📁 **Multiple Audio Formats**: Supports `.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, and `.aiff`.

---

## 📋 Prerequisites

- **macOS**: Utilizes the pre-installed `/usr/bin/afplay` audio player.
- **Node.js**: Version 16 or higher (`node -v`).

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/batranitika505-tech/terminalapplication.git
   cd terminalapplication
   ```

2. **Launch the player**:
   ```bash
   node player.js
   ```

---

## ⌨️ Controls

| Key | Action | Description |
| :--- | :--- | :--- |
| `↑` / `k` | **Move Up** | Navigate up through the song list |
| `↓` / `j` | **Move Down** | Navigate down through the song list |
| `Enter` | **Play** | Start playing the selected track from the beginning |
| `Space` / `P` | **Pause / Resume** | Toggle pause and resume on the active song |
| `R` | **Resume** | Resume playback if currently paused |
| `S` | **Stop** | Stop playback without quitting |
| `Q` / `Ctrl+C` | **Quit** | Stop all audio and cleanly exit to the terminal |

---

## 📂 Adding Your Own Songs

Drop any supported audio files (`.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.aiff`) into the `songs/` folder:

```bash
cp /path/to/my-song.mp3 songs/
```

When you launch `node player.js`, the playlist will automatically scan, sort, and display all available tracks.

---

## 🧪 Testing

Run the included automated integration test suite to verify UI rendering, track switching, pause/resume signaling, and clean teardown:

```bash
node test.js
```

---

## 📁 Project Structure

```text
terminalapplication/
├── player.js       # Main terminal music player application
├── test.js         # Automated end-to-end integration test suite
├── songs/          # Directory containing audio files
│   ├── queenClassic.mp3
│   ├── redbone.mp3
│   ├── sample-25s.mp3
│   ├── sample-speech-1m.mp3
│   ├── sample.mp3
│   └── test.mp3
└── README.md       # Project documentation
```
