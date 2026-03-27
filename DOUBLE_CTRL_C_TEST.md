# Double Ctrl+C Exit Feature - Test Guide

## What Changed

Modified `src/cli/run/stdin-suppression.ts` to require **two Ctrl+C presses** to exit, preventing accidental exits.

## How It Works

1. **First Ctrl+C Press**:
   - Shows warning message: `Press Ctrl+C again to exit.`
   - Starts 500ms timer
   - Does NOT exit

2. **Second Ctrl+C Press** (within 500ms):
   - Exits the application
   - Cleans up resources properly

3. **Timeout** (after 500ms):
   - Resets counter
   - Next Ctrl+C will show warning again

## Testing Instructions

### Manual Test

1. Run oh-my-opencode with any command:
   ```bash
   bun bin/oh-my-opencode.js "test message"
   ```

2. Press `Ctrl+C` once
   - **Expected**: See yellow warning message "Press Ctrl+C again to exit."
   - **Expected**: Application continues running

3. Within 2 seconds, press `Ctrl+C` again
   - **Expected**: Application exits gracefully

4. Wait 1 second after first Ctrl+C, then press again
   - **Expected**: Warning shows again (counter reset)

### Code Verification

The built code should contain:
```javascript
const DOUBLE_PRESS_WINDOW_MS = 500;
console.log(`\x1B[33mPress Ctrl+C again to exit.\x1B[0m`);
```

Check with:
```bash
grep -n "Press Ctrl+C again" dist/cli/index.js
```

## Installation Status

✅ Modified source: `src/cli/run/stdin-suppression.ts`
✅ Built dist: `dist/cli/index.js`
✅ Backup created: `~/.bun/install/cache/oh-my-openagent.backup`

## Revert to Original

If you need to revert:
```bash
cd /home/kzhang82
rm -rf .bun/install/cache/oh-my-openagent
cp -r .bun/install/cache/oh-my-openagent.backup .bun/install/cache/oh-my-openagent
```

## Commit Info

- **Commit**: f10e4ef
- **Branch**: dev
- **Repo**: https://github.com/kaiger666888/oh-my-openagent
