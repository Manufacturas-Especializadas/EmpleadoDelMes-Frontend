export function queryString(params: {
  pageNumber: number
  pageSize?: number
  term?: string
  campaignId?: string
}) {
  const query = new URLSearchParams({
    pageNumber: String(params.pageNumber),
    pageSize: String(params.pageSize ?? 20),
  })
  if (params.term) query.set('term', params.term)
  if (params.campaignId) query.set('campaignId', params.campaignId)
  return query.toString()
}
