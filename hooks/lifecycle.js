#!/usr/bin/env node
// SessionStart/SessionEnd lifecycle: launch the menu bar app when Claude Code opens
// (SessionStart fires on desktop-app launch, on `claude` in a terminal, and when a
// conversation is opened). The app quits ITSELF when it's no longer needed (Claude
// closed and no active session) — see main.swift checkLifecycle() — so this no longer
// kills the app.
//
// Active sessions are tracked as one file per session id (read from the hook JSON on
// stdin) under sessions.d/. This is race-free: the desktop app fires a burst of
// transient warmup sessions on launch, and a shared numeric counter drifted under that
// concurrency. Distinct files don't. The app counts the files to know a CLI session is
// alive when there's no desktop process to watch.
// Usage: node lifecycle.js <start|end>   (hook JSON, incl. session_id, arrives on stdin)

const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const BUNDLE_ID = "com.local.claudebeacon";
const EXEC = "ClaudeBeacon";
const dir = path.join(os.homedir(), ".claude", "statusbar");
const sessDir = path.join(dir, "sessions.d");
const event = process.argv[2];

fs.mkdirSync(sessDir, { recursive: true });

const running = () => { try { cp.execSync(`pgrep -x ${EXEC}`, { stdio: "ignore" }); return true; } catch { return false; } };
const safeId = (s) => String(s || "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 64) || "unknown";

let input = "", done = false;
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => run());
process.stdin.on("error", () => run());
setTimeout(run, 1000); // hooks always pipe stdin, but never hang the session

function run() {
  if (done) return; done = true;
  let id = "";
  try { id = JSON.parse(input).session_id; } catch {}
  id = safeId(id);

  if (event === "start") {
    // If the app isn't running, any leftover session files are stale (e.g. a prior
    // crash) — clear them so the count starts honest.
    if (!running()) { try { for (const f of fs.readdirSync(sessDir)) fs.rmSync(path.join(sessDir, f), { force: true }); } catch {} }
    try { fs.writeFileSync(path.join(sessDir, id), ""); } catch {}
    cp.spawn("open", ["-g", "-b", BUNDLE_ID], { stdio: "ignore", detached: true }).unref();
  } else if (event === "end") {
    try { fs.rmSync(path.join(sessDir, id), { force: true }); } catch {}
  }
  process.exit(0);
}
