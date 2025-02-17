const { spawn } = require("child_process");
const waitOn = require("wait-on");
process.env.NODE_ENV = "development";

(async () => {
    console.log("Starting Vite...");
    const vite = spawn("vite", { stdio: "inherit", shell: true });

    console.log("Waiting for Vite to be ready...");
    await waitOn({ resources: ["http://127.0.0.1:3001"],  verbose: true,timeout: 60000 });

    console.log("Starting Electron...");
    const electron = spawn("electron", ["."], { stdio: "inherit", shell: true });

    electron.on("exit", () => {
        console.log("Electron exited");
        process.exit();
    });

    process.on("exit", () => {
        vite.kill();
        electron.kill();
    });
})();