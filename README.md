# Claude Beacon

A lightweight macOS menu bar app that shows **Claude Code's live status** at a glance — animated spark while thinking, a label for the active tool, a yellow dot when awaiting your permission, and a live elapsed-time timer. No window, no dock icon, no dashboards. Just a tiny, always-visible indicator next to your battery and clock.

> Built so you can tab away during a long run and still know at a glance whether Claude is working, waiting on you, or done.

<img width="1016" height="566" alt="Claude Beacon demo" src="https://github.com/user-attachments/assets/55a7b294-e893-4f73-b16b-b8beef784400" />

<a href="https://github.com/Gikunjuu/claude-beacon/releases/latest/download/ClaudeBeacon.dmg"><img src="assets/download.png" alt="Download ClaudeBeacon.dmg for macOS" width="260"></a>

Signed and notarized — opens normally, no Gatekeeper warning. See [Install](#install) for details.

---

## What it shows

| State | Indicator |
|---|---|
| **Thinking / working** | Animated Claude spark + live `1m 23s` timer |
| **Running a tool** | Short label: `Editing`, `Reading`, `Running command`, `Using tool`, … |
| **Awaiting permission** | Paused yellow dot + macOS notification (CLI only — see [note below](#permission-detection-is-cli-only)) |
| **Recently done** | Green checkmark for 10 minutes after a turn finishes |
| **Idle** | Static Claude logo |

Two animation styles (pick in the menu):
- **Claude** — the web "morph" spark
- **Claude Code** — the terminal glyph spinner
- **Crab Walking** — because why not

Two color modes: **Orange** (Anthropic's `#d97757`) or **System** (adaptive black/white, matches your other menu bar icons). The elapsed timer can be toggled off. All preferences are persisted.

### Notifications

Claude Beacon fires macOS notifications so you can step away during long runs and get pulled back when it matters:

| Notification | When | Surface |
|---|---|---|
| **Claude finished** | Any CLI turn that runs 5+ minutes | CLI only |
| **Approval needed** | The moment a permission prompt appears | CLI only |

Both have an action button — "Open" or "Review" — that brings the terminal to front. Toggle either off under **Settings → Notifications** in the menu.

---

## Where it works

Driven entirely by Claude Code hooks — so it tracks **Claude Code** activity only:

| Surface | Tracked? |
|---|---|
| Claude Code CLI (`claude` in terminal) | ✅ |
| Claude Code Desktop — **Code** tab | ✅ |
| Claude Desktop — **Chat** tab | ❌ |
| **Cowork** | ❌ |
| IDE extensions (VS Code / JetBrains) | ❌ |

Chat and Cowork don't fire Claude Code's hook events, so the status bar stays idle while you're in those surfaces.

### Permission detection is CLI-only

The yellow dot and permission notification fire from Claude Code's permission hook, which only runs in the **CLI**. The Desktop app handles its permission prompts in-app and doesn't emit that hook — the icon stays on the current tool label while the prompt is open. Everything else (thinking, tools, lifecycle, completion sound) works identically in both CLI and Desktop.

If you run in **auto / bypass mode**, permission prompts never fire anyway, so this distinction is moot.

---

## Requirements

- macOS 12 Monterey or later
- [Claude Code](https://claude.com/claude-code) (CLI or Desktop app)
- Node.js (for the lightweight hook scripts)

---

## Install

### Option A — DMG (recommended)

1. Download the latest **`ClaudeBeacon.dmg`** from [Releases](../../releases).
2. Open it and drag **Claude Beacon** into your Applications folder.
3. Launch it once — on first launch it automatically wires up the Claude Code hooks.
4. Start a new Claude Code session and watch the spark appear.

> **Already have Claude Code open?** Restart it (or open a new session) once after installing. A running session loads its hooks at startup, so it won't pick up newly installed ones until you start fresh. After that first restart it's fully automatic.

> **Current release is ad-hoc signed, not notarized.** macOS will show an "unidentified developer" warning on first open — right-click **Claude Beacon.app** (after dragging it to Applications) and choose **Open**, then confirm. This is temporary until Developer ID signing is set up for future releases.

If the first-launch setup doesn't take, run it manually:
```bash
node "/Applications/ClaudeBeacon.app/Contents/Resources/install.js"
```

### Updating to a new version

1. Download the latest DMG from [Releases](../../releases).
2. Open it and drag **Claude Beacon** into Applications — choose **Replace** when prompted. No need to uninstall first.
3. Launch it once. On a version change it automatically refreshes its hooks and cleans up anything an older version left behind.
4. Restart Claude Code (or open a new session) to pick up the refreshed hooks.

### Option B — Claude Code plugin

Installs the hooks from inside Claude Code, without touching your Applications folder manually:

```
/plugin marketplace add Gikunjuu/claude-beacon
/plugin install claude-beacon@claude-beacon
```

You'll still need to drag the app into Applications once; the plugin launches it automatically on session start.

### Hide the Desktop app's built-in icon

The Claude Desktop app shows its own menu bar icon (the quick-screenshot button). To avoid two icons sitting side by side, go to Claude's **Settings → General** and disable the built-in menu bar item. Claude Beacon then gives you a single, animated indicator for everything.

---

## How it works

Claude Code fires hooks on its lifecycle events. Small Node.js scripts write the current status to `~/.claude/statusbar/state.json`; the menu bar app polls that file and renders the appropriate spark, label, and timer.

`SessionStart` / `SessionEnd` hooks launch the app when Claude Code opens and quit it when the last active session closes (a per-session file counter handles multiple concurrent windows cleanly).

The installer merges its hooks into `~/.claude/settings.json` without touching your existing hooks, and backs the file up on first run (`settings.json.bak-statusbar`).

---

## Uninstall

```bash
node "/Applications/ClaudeBeacon.app/Contents/Resources/uninstall.js"
```

This removes only the status bar's hooks — your other hooks are untouched. Then drag the app to the Trash.

---

## Build from source

```bash
git clone https://github.com/Gikunjuu/claude-beacon
cd claude-beacon
./build.sh          # builds build/ClaudeBeacon.app
./build.sh --dmg    # also produces build/ClaudeBeacon.dmg
```

Requires Xcode Command Line Tools:
```bash
xcode-select --install
```

For a signed + notarized release build you'll need a **Developer ID Application** certificate in your keychain and a `notarytool` credential profile configured. The build script falls back to an ad-hoc local build if no Developer ID cert is found.

---

## Trademark notice

This is an unofficial, open-source project. **It is not affiliated with, endorsed by, or sponsored by Anthropic.** "Claude" and the Claude logo are trademarks of Anthropic. Built as a free productivity tool for the Claude Code community.

---

## License

MIT © Collins Gikunju
