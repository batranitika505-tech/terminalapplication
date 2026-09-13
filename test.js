const { spawn } = require("node:child_process");
const path = require("path");

function runTest() {
    console.log("Starting automated player integration test...");

    const playerProcess = spawn("node", [path.join(__dirname, "player.js")], {
        stdio: ["pipe", "pipe", "pipe"]
    });

    let output = "";
    playerProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    playerProcess.stderr.on("data", (data) => {
        console.error("STDERR:", data.toString());
    });

    // Step 1: Navigate down twice to select sample-25s.mp3
    setTimeout(() => {
        console.log("Step 1: Navigating down to song 3...");
        playerProcess.stdin.write("\x1b[B"); // Down
        playerProcess.stdin.write("\x1b[B"); // Down
    }, 400);

    // Step 2: Press Enter to play
    setTimeout(() => {
        console.log("Step 2: Playing song...");
        playerProcess.stdin.write("\r");
    }, 800);

    // Step 3: Pause
    setTimeout(() => {
        console.log("Step 3: Pausing song (Space)...");
        playerProcess.stdin.write(" ");
    }, 1500);

    // Step 4: Resume
    setTimeout(() => {
        console.log("Step 4: Resuming song (Space)...");
        playerProcess.stdin.write(" ");
    }, 2200);

    // Step 5: Switch directly to another song (rapid switch test)
    setTimeout(() => {
        console.log("Step 5: Rapid switch to song 4...");
        playerProcess.stdin.write("\x1b[B");
        playerProcess.stdin.write("\r");
    }, 2800);

    // Step 6: Stop
    setTimeout(() => {
        console.log("Step 6: Stopping song (s)...");
        playerProcess.stdin.write("s");
    }, 3400);

    // Step 7: Quit
    setTimeout(() => {
        console.log("Step 7: Quitting player (q)...");
        playerProcess.stdin.write("q");
    }, 4000);

    playerProcess.on("close", (code) => {
        console.log(`Player process exited with code: ${code}`);

        // Check output assertions
        const hasHeader = output.includes("TERMINAL AUDIO PLAYER");
        const hasPlaying = output.includes("Playing:") || output.includes("[▶ PLAYING]");
        const hasPaused = output.includes("Paused:") || output.includes("[⏸ PAUSED]");
        const hasResumed = output.includes("Resumed:");
        const hasStopped = output.includes("Stopped:");
        const hasQuit = output.includes("Thanks for using Songs App");

        console.log("Assertions:");
        console.log("- Header rendered:", hasHeader);
        console.log("- Playback started:", hasPlaying);
        console.log("- Song paused:", hasPaused);
        console.log("- Song resumed:", hasResumed);
        console.log("- Song stopped:", hasStopped);
        console.log("- Clean quit message:", hasQuit);

        if (hasHeader && hasPlaying && hasPaused && hasResumed && hasStopped && hasQuit) {
            console.log("✅ ALL INTEGRATION TESTS PASSED!");
            process.exit(0);
        } else {
            console.error("❌ Some assertions failed!");
            process.exit(1);
        }
    });
}

runTest();