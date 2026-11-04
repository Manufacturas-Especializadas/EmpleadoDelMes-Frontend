import type { OpinionCampaign } from './types'
export function campaignMonth(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return 'Mes no disponible'
  const label = new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
  return label[0].toUpperCase() + label.slice(1)
}
export function canWriteOpinion(campaign: OpinionCampaign) {
  return campaign.canAcceptOpinions && !campaign.isArchived
}
export function sortCampaigns(items: OpinionCampaign[]) {
  return [...items].sort((a, b) => b.evaluationMonth.localeCompare(a.evaluationMonth))
}
export function defaultCampaign(items: OpinionCampaign[], requested?: string) {
  return (
    items.find((item) => item.id === requested) ??
    items.find(canWriteOpinion) ??
    items.find((item) => !item.isArchived) ??
    items[0]
  )
}
