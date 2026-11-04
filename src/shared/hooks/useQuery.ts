import { useEffect, useEffectEvent, useState } from 'react'
export function useQuery<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
  enabled = true,
) {
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: '' })
  const [revision, setRevision] = useState(0)
  const queryKey = key + ':' + revision
  const run = useEffectEvent(load)
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    void run(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ key: queryKey, data })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            key: queryKey,
            error: error instanceof Error ? error.message : 'No pudimos consultar los datos.',
          })
      })
    return () => controller.abort()
  }, [queryKey, enabled])
  return {
    data: enabled && state.key === queryKey ? state.data : undefined,
    error: enabled && state.key === queryKey ? state.error : undefined,
    loading: enabled && state.key !== queryKey,
    reload: () => setRevision((value) => value + 1),
  }
}
