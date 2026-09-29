export interface WorkListLoadResult {
  ok: boolean
  raw?: string | null
  revision?: string | null
  path?: string
  error?: string
}

export interface WorkListSaveResult {
  ok: boolean
  revision?: string | null
  path?: string
  error?: string
  conflict?: boolean
  raw?: string | null
}

const RPC_PATH = '/work-list/rpc'

async function post(body: unknown): Promise<Response> {
  return fetch(RPC_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function loadWorkList(): Promise<WorkListLoadResult> {
  const response = await post({ method: 'load', args: {} })
  const result = await response.json() as WorkListLoadResult
  if (!response.ok || result.ok === false) throw new Error(result.error || 'work-list load failed')
  return result
}

export async function saveWorkList(state: unknown, baseRevision: string | null): Promise<WorkListSaveResult> {
  const response = await post({ method: 'save', args: { state, baseRevision } })
  const result = await response.json() as WorkListSaveResult
  if (response.status === 409 && result.conflict) return result
  if (!response.ok || result.ok === false) throw new Error(result.error || 'work-list save failed')
  return result
}
