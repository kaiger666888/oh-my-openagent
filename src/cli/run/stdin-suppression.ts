type StdinLike = {
  isTTY?: boolean
  isRaw?: boolean
  setRawMode?: (mode: boolean) => void
  isPaused?: () => boolean
  resume: () => void
  pause: () => void
  on: (event: "data", listener: (chunk: string | Uint8Array) => void) => void
  removeListener: (event: "data", listener: (chunk: string | Uint8Array) => void) => void
}

function includesCtrlC(chunk: string | Uint8Array): boolean {
  const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8")
  return text.includes("\u0003")
}

export function suppressRunInput(
  stdin: StdinLike = process.stdin,
  onInterrupt: () => void = () => {
    process.kill(process.pid, "SIGINT")
  }
): () => void {
  if (!stdin.isTTY) {
    return () => {}
  }

  const wasRaw = stdin.isRaw === true
  const wasPaused = stdin.isPaused?.() ?? false
  const canSetRawMode = typeof stdin.setRawMode === "function"

  let ctrlCCount = 0
  let ctrlCTimer: ReturnType<typeof setTimeout> | null = null
  const DOUBLE_PRESS_WINDOW_MS = 500

  const onData = (chunk: string | Uint8Array) => {
    if (includesCtrlC(chunk)) {
      ctrlCCount++

      if (ctrlCCount === 1) {
        // First Ctrl+C: show warning and start timer
        console.log("\n\u001b[33mPress Ctrl+C again to exit.\u001b[0m")
        ctrlCTimer = setTimeout(() => {
          ctrlCCount = 0
          ctrlCTimer = null
        }, DOUBLE_PRESS_WINDOW_MS)
      } else if (ctrlCCount >= 2) {
        // Second Ctrl+C: actually exit
        if (ctrlCTimer) {
          clearTimeout(ctrlCTimer)
        }
        ctrlCCount = 0
        onInterrupt()
      }
    }
  }

  if (canSetRawMode) {
    stdin.setRawMode!(true)
  }
  stdin.on("data", onData)
  stdin.resume()

  return () => {
    stdin.removeListener("data", onData)
    if (ctrlCTimer) {
      clearTimeout(ctrlCTimer)
    }
    if (canSetRawMode) {
      stdin.setRawMode!(wasRaw)
    }
    if (wasPaused) {
      stdin.pause()
    }
  }
}
