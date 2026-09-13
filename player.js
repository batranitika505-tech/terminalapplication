const { spawn } = require("node:child_process");
const fs = require("fs");

const path = "./songs";
const songs = fs.readdirSync(path).filter(song => song.endsWith(".mp3"));

let selected = 0;
let childProcess = null;

function showSongs() {
    console.clear();

    console.log("🎵 Welcome to the Songs App 🎵\n");

    for (let i = 0; i < songs.length; i++) {
        if (i === selected) {
            console.log(`> ${i + 1}: ${songs[i]}`);
        } else {
            console.log(`  ${i + 1}: ${songs[i]}`);
        }
    }

    console.log("\n↑ ↓ Select   Enter Play   P Pause   R Resume   Q Quit");
}

function player() {
    if (childProcess) {
        childProcess.kill();
    }

    console.log(`\nSelected song: ${songs[selected]}`);

    childProcess = spawn("afplay", [`${path}/${songs[selected]}`]);

    childProcess.on("close", () => {
        childProcess = null;
        console.log("Song finished... 🫠");
        console.log("Select another song or press Q to quit.");
    });
}

function pause() {
    if (childProcess) {
        childProcess.kill("SIGSTOP");
        console.log("Pause");
    }
}

function resume() {
    if (childProcess) {
        childProcess.kill("SIGCONT");
        console.log("Resume");
    }
}

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);

process.stdin.on("data", (input) => {

    // Quit
    if (input === "q") {
        if (childProcess) {
            childProcess.kill();
        }

        process.stdin.setRawMode(false);
        process.exit(0);
    }

    // Pause
    if (input === "p") {
        pause();
    }

    // Resume
    if (input === "r") {
        resume();
    }

    // Down Arrow
    if (input === "\x1b[B") {
        if (selected < songs.length - 1) {
            selected++;
            showSongs();
        }
    }

    // Up Arrow
    if (input === "\x1b[A") {
        if (selected > 0) {
            selected--;
            showSongs();
        }
    }

    // Enter
    if (input === "\r") {
        player();
    }
});

showSongs();