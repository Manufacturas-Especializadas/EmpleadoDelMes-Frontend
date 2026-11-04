import { useEffect, useRef } from 'react'
/** El dialog nativo controla foco, Escape e inactividad del contenido de fondo. */
export function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const previous = document.activeElement
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus()
    }
  }, [open])
  return ref
}
