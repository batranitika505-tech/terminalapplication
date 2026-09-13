const { spawn } = require("node:child_process");
const fs = require("fs");
const path = require("path");

const songsDir = path.join(__dirname, "songs");
const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".aac", ".flac", ".aiff"]);

function loadSongs() {
    if (!fs.existsSync(songsDir)) {
        return [];
    }
    return fs.readdirSync(songsDir)
        .filter(file => AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

let songs = loadSongs();
let selected = 0;
let childProcess = null;
let playingIndex = null;
let isPaused = false;
let statusMessage = "Select a song and press Enter or Space to play";

const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    hideCursor: "\x1b[?25l",
    showCursor: "\x1b[?25h"
};

function render() {
    console.clear();

    console.log(`${ANSI.cyan}${ANSI.bold}╔════════════════════════════════════════════════════════╗${ANSI.reset}`);
    console.log(`${ANSI.cyan}${ANSI.bold}║              🎵  TERMINAL AUDIO PLAYER  🎵             ║${ANSI.reset}`);
    console.log(`${ANSI.cyan}${ANSI.bold}╚════════════════════════════════════════════════════════╝${ANSI.reset}\n`);

    if (songs.length === 0) {
        console.log(`  ${ANSI.yellow}No audio files found in ${songsDir}${ANSI.reset}\n`);
    } else {
        for (let i = 0; i < songs.length; i++) {
            const isSelected = i === selected;
            const isPlayingThis = i === playingIndex;

            let prefix = isSelected ? `${ANSI.green}${ANSI.bold}>${ANSI.reset} ` : "  ";
            let numStr = `${ANSI.dim}${(i + 1).toString().padStart(2, " ")}.${ANSI.reset} `;
            let nameStr = isSelected ? `${ANSI.bold}${songs[i]}${ANSI.reset}` : songs[i];

            let badge = "";
            if (isPlayingThis) {
                if (isPaused) {
                    badge = `  ${ANSI.yellow}${ANSI.bold}[⏸ PAUSED]${ANSI.reset}`;
                } else {
                    badge = `  ${ANSI.green}${ANSI.bold}[▶ PLAYING]${ANSI.reset}`;
                }
            }

            console.log(`${prefix}${numStr}${nameStr}${badge}`);
        }
    }

    console.log(`\n${ANSI.dim}──────────────────────────────────────────────────────────${ANSI.reset}`);
    console.log(`  ${ANSI.bold}Status:${ANSI.reset} ${statusMessage}`);
    console.log(`${ANSI.dim}──────────────────────────────────────────────────────────${ANSI.reset}`);
    console.log(`${ANSI.dim}[↑/↓/j/k] Navigate   [Enter] Play   [Space/P] Pause/Resume${ANSI.reset}`);
    console.log(`${ANSI.dim}[S] Stop             [R] Resume     [Q/Ctrl+C] Quit${ANSI.reset}\n`);
}

function stopCurrentPlayer() {
    if (childProcess) {
        const proc = childProcess;
        childProcess = null;
        proc.removeAllListeners();
        try {
            // Send SIGKILL so even stopped (SIGSTOP) processes terminate immediately
            proc.kill("SIGKILL");
        } catch (e) {
            // Process may already have terminated
        }
    }
    playingIndex = null;
    isPaused = false;
}

function playSong(index) {
    if (songs.length === 0) return;
    if (index < 0 || index >= songs.length) return;

    stopCurrentPlayer();

    const songName = songs[index];
    const songPath = path.join(songsDir, songName);

    try {
        const proc = spawn("afplay", [songPath]);
        childProcess = proc;
        playingIndex = index;
        isPaused = false;
        statusMessage = `${ANSI.green}▶ Playing: ${songName}${ANSI.reset}`;

        proc.on("error", (err) => {
            if (childProcess === proc) {
                childProcess = null;
                playingIndex = null;
                isPaused = false;
                statusMessage = `${ANSI.red}❌ Playback error: ${err.message}${ANSI.reset}`;
                render();
            }
        });

        proc.on("close", (code) => {
            // Only update state if this is still the active process
            if (childProcess === proc) {
                childProcess = null;
                playingIndex = null;
                isPaused = false;
                if (code === 0) {
                    statusMessage = `${ANSI.cyan}Song finished: ${songName} 🎵${ANSI.reset}`;
                } else if (code !== null) {
                    statusMessage = `${ANSI.yellow}⚠️ Playback ended (${songName}, code: ${code})${ANSI.reset}`;
                }
                render();
            }
        });
    } catch (err) {
        statusMessage = `${ANSI.red}❌ Failed to spawn player: ${err.message}${ANSI.reset}`;
    }

    render();
}

function togglePauseResume() {
    if (!childProcess || playingIndex === null) {
        if (songs.length > 0) {
            playSong(selected);
        }
        return;
    }

    if (isPaused) {
        resumeSong();
    } else {
        pauseSong();
    }
}

function pauseSong() {
    if (childProcess && !isPaused && playingIndex !== null) {
        try {
            childProcess.kill("SIGSTOP");
            isPaused = true;
            statusMessage = `${ANSI.yellow}⏸ Paused: ${songs[playingIndex]}${ANSI.reset}`;
            render();
        } catch (err) {
            statusMessage = `${ANSI.red}❌ Failed to pause: ${err.message}${ANSI.reset}`;
            render();
        }
    }
}

function resumeSong() {
    if (childProcess && isPaused && playingIndex !== null) {
        try {
            childProcess.kill("SIGCONT");
            isPaused = false;
            statusMessage = `${ANSI.green}▶ Resumed: ${songs[playingIndex]}${ANSI.reset}`;
            render();
        } catch (err) {
            statusMessage = `${ANSI.red}❌ Failed to resume: ${err.message}${ANSI.reset}`;
            render();
        }
    }
}

function stopSong() {
    if (childProcess) {
        const songName = playingIndex !== null ? songs[playingIndex] : "Song";
        stopCurrentPlayer();
        statusMessage = `${ANSI.dim}⏹ Stopped: ${songName}${ANSI.reset}`;
        render();
    }
}

function cleanupAndExit() {
    stopCurrentPlayer();
    try {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
    } catch (e) {}
    process.stdout.write(ANSI.showCursor);
    console.clear();
    console.log("👋 Thanks for using Songs App! Goodbye.\n");
    process.exit(0);
}

// Ensure cleanup on signals
process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);
process.on("exit", () => {
    stopCurrentPlayer();
    process.stdout.write(ANSI.showCursor);
});

// Configure stdin input
process.stdin.setEncoding("utf-8");
process.stdin.resume();

if (process.stdin.isTTY) {
    try {
        process.stdin.setRawMode(true);
    } catch (e) {}
    process.stdout.write(ANSI.hideCursor);
}

process.stdin.on("data", (input) => {
    // Ctrl+C
    if (input === "\u0003") {
        cleanupAndExit();
        return;
    }

    // Q: Quit
    if (input === "q" || input === "Q") {
        cleanupAndExit();
        return;
    }

    // Up Arrow or 'k'/'K'
    if (input === "\x1b[A" || input === "k" || input === "K") {
        if (selected > 0) {
            selected--;
            render();
        }
        return;
    }

    // Down Arrow or 'j'/'J'
    if (input === "\x1b[B" || input === "j" || input === "J") {
        if (selected < songs.length - 1) {
            selected++;
            render();
        }
        return;
    }

    // Enter: Play selected song
    if (input === "\r" || input === "\n") {
        playSong(selected);
        return;
    }

    // Space: Toggle Play/Pause
    if (input === " ") {
        togglePauseResume();
        return;
    }

    // P: Pause / Toggle
    if (input === "p" || input === "P") {
        if (isPaused) {
            resumeSong();
        } else {
            pauseSong();
        }
        return;
    }

    // R: Resume
    if (input === "r" || input === "R") {
        resumeSong();
        return;
    }

    // S: Stop
    if (input === "s" || input === "S") {
        stopSong();
        return;
    }
});

// Initial render
render();