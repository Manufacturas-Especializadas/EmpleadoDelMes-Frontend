import { useState } from 'react'
import { SearchInput } from './SearchInput'
import { TextField } from './TextField'
export function ListFilters({
  onSearch,
  campaign = false,
  initialCampaign = '',
  requiredTerm = false,
}: {
  onSearch: (term: string, campaignId: string) => void
  campaign?: boolean
  initialCampaign?: string
  requiredTerm?: boolean
}) {
  const [term, setTerm] = useState('')
  const [campaignId, setCampaignId] = useState(initialCampaign)
  return (
    <form
      className="my-4 flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(term.trim(), campaignId.trim())
      }}
    >
      {campaign && (
        <TextField
          label="Identificador de convocatoria"
          value={campaignId}
          onChange={(event) => setCampaignId(event.target.value)}
          required
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          hint="Administración puede compartirlo desde el detalle de la convocatoria."
        />
      )}
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
