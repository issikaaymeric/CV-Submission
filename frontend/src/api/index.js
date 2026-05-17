import axios from 'axios'

// Public client — no auth
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Admin client — Basic Auth injected per call
export function adminApi(username, password) {
  return axios.create({
    baseURL: '/api/admin',
    auth: { username, password },
  })
}

// ── Candidature (public) ──────────────────────────────────────────────────

/**
 * Submit a candidature.
 * @param {Object} formData - SubmitRequest fields
 * @param {File}   cvFile   - The CV file
 */
export async function submitCandidature(formData, cvFile) {
  const fd = new FormData()
  // Spring expects @RequestPart("data") as JSON blob
  fd.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }))
  fd.append('cv', cvFile)
  const { data } = await axios.post('/api/candidatures', fd)
  return data
}

// ── Admin ─────────────────────────────────────────────────────────────────

export async function fetchCandidatures(auth, { categorie, search, page, size } = {}) {
  const client = adminApi(auth.username, auth.password)
  const params = { page: page ?? 0, size: size ?? 20 }
  if (categorie) params.categorie = categorie
  if (search)    params.search = search
  const { data } = await client.get('/candidatures', { params })
  return data
}

export async function fetchStats(auth) {
  const { data } = await adminApi(auth.username, auth.password).get('/stats')
  return data
}

export async function getDownloadUrl(auth, id) {
  const { data } = await adminApi(auth.username, auth.password)
    .get(`/candidatures/${id}/download`)
  return data.url
}

export async function deleteCandidature(auth, id) {
  await adminApi(auth.username, auth.password).delete(`/candidatures/${id}`)
}
