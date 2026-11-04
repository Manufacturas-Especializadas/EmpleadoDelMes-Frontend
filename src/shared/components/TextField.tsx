import { Icon } from './Icon'
import { useId, type ComponentProps } from 'react'
type Props = ComponentProps<'input'> & { label: string; error?: string; hint?: string }
export function TextField({ label, error, hint, id, ...props }: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const description =
    [props['aria-describedby'], hint ? `${inputId}-hint` : '', error ? `${inputId}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined
  return (
    <div className="min-w-0 max-w-full">
      <label htmlFor={inputId}>{label}</label>
      <div className="relative">
        {props.type === 'search' && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <Icon name="search" />
          </span>
        )}
        <input
          {...props}
          className={`${props.type === 'search' ? 'pl-10' : ''} ${props.className ?? ''}`}
          id={inputId}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={description}
        />
      </div>
      {hint && (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
