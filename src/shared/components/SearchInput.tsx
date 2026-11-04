import type { ComponentProps } from 'react'
import { TextField } from './TextField'
type Props = Omit<ComponentProps<typeof TextField>, 'type' | 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}
export function SearchInput({ value, onValueChange, ...props }: Props) {
  return (
    <TextField
      {...props}
      type="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  )
}
