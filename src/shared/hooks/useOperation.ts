import { useEffect, useRef, useState } from 'react'
export function useOperation() {
  const controller = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(
    () => () => {
      controller.current?.abort()
    },
    [],
  )
  async function run(action: (signal: AbortSignal) => Promise<void>) {
    if (controller.current) return
    const current = new AbortController()
    controller.current = current
    setBusy(true)
    setError('')
    try {
      await action(current.signal)
    } catch (error) {
      if (!current.signal.aborted)
        setError(error instanceof Error ? error.message : 'No pudimos guardar los datos.')
    } finally {
      controller.current = null
      if (!current.signal.aborted) setBusy(false)
    }
  }
  return { busy, error, run, clearError: () => setError('') }
}
