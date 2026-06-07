import { existsSync, writeFileSync } from "node:fs";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";

const setupOnly = process.argv.includes("--setup-only");

const backendEnv = `## Environment Variables
PORT=3001
JWT_KEY=supersecretkey_example

## Development Database
DEV_DB_USERNAME=conduit
DEV_DB_PASSWORD=conduit_dev_pass
DEV_DB_NAME=conduit_dev
DEV_DB_HOSTNAME=127.0.0.1
DEV_DB_PORT=5433
DEV_DB_DIALECT=postgres
DEV_DB_LOGGING=false
`;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureBackendEnv() {
  if (existsSync("backend/.env")) {
    console.log("[demo] backend/.env already exists; leaving it unchanged");
    return;
  }
  writeFileSync("backend/.env", backendEnv);
  console.log("[demo] wrote backend/.env for local Postgres on 127.0.0.1:5433");
}

function ensureDependencies() {
  if (existsSync("node_modules")) {
    console.log("[demo] node_modules exists; skipping npm install");
    return;
  }
  run("npm", ["install"]);
}

function waitForPort({ host, port, timeoutMs }) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.createConnection({ host, port });
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(attempt, 500);
      });
    };
    attempt();
  });
}

function portIsOpen({ host, port }) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function assertPortAvailable(port) {
  if (await portIsOpen({ host: "127.0.0.1", port })) {
    throw new Error(`Port ${port} is already in use. Stop the existing process before running npm run dev:demo.`);
  }
}

async function waitForPostgresReady({ timeoutMs }) {
  const started = Date.now();
  while (Date.now() - started <= timeoutMs) {
    const result = spawnSync(
      "docker",
      ["compose", "-f", "docker-compose.db.yml", "exec", "-T", "conduit_db", "pg_isready", "-d", "conduit_dev", "-U", "conduit"],
      { stdio: "pipe", shell: process.platform === "win32" },
    );
    if (result.status === 0) return;
    await delay(500);
  }
  throw new Error("Timed out waiting for Postgres to accept connections");
}

ensureBackendEnv();
ensureDependencies();
run("docker", ["compose", "-f", "docker-compose.db.yml", "up", "-d"]);
await waitForPort({ host: "127.0.0.1", port: 5433, timeoutMs: 30000 });
await waitForPostgresReady({ timeoutMs: 30000 });
run("node", ["backend/seed-demo.js"]);

if (setupOnly) {
  console.log("[demo] setup complete. Start the app with: npm run dev");
  process.exit(0);
}

await assertPortAvailable(3000);
await assertPortAvailable(3001);
console.log("[demo] starting frontend on http://localhost:3000 and API on http://localhost:3001");
const child = spawn("npm", ["run", "dev"], { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
