import { useId } from 'react'
export function ToggleSwitch({
  checked,
  label,
  disabled = false,
  loading = false,
  onChange,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  loading?: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex min-h-14 items-center justify-between gap-4">
      <span id={id} className="text-sm font-semibold">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        aria-busy={loading}
        disabled={disabled || loading}
        onClick={() => onChange(!checked)}
        className="mesa-switch"
      >
        <span className="mesa-switch-track">
          <span className="mesa-switch-thumb">
            {loading && <span className="spinner size-3 text-primary" aria-hidden="true" />}
          </span>
        </span>
      </button>
    </div>
  )
}
