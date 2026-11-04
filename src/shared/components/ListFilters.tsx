import { useState } from 'react'
import { SearchInput } from './SearchInput'
export function ListFilters({
  onSearch,
  requiredTerm = false,
}: {
  onSearch: (term: string) => void
  requiredTerm?: boolean
}) {
  const [term, setTerm] = useState('')
  return (
    <form
      className="filter-panel"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(term.trim())
      }}
    >
      <SearchInput
        label="Nombre o nómina"
        value={term}
        onValueChange={setTerm}
        maxLength={100}
        required={requiredTerm}
      />
      <button className="primary">Buscar</button>
    </form>
  )
}
