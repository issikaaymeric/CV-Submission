import { useState, useEffect, useCallback } from 'react'
import { fetchCandidatures, fetchStats, getDownloadUrl, deleteCandidature } from '../api'
import CategoryBadge, { CATEGORY_STYLES } from '../components/CategoryBadge'

const CATEGORIES = ['TECH', 'MARKETING', 'FINANCE', 'RH', 'JURIDIQUE']

const STAT_COLORS = {
  TECH:      'bg-blue-500',
  MARKETING: 'bg-pink-500',
  FINANCE:   'bg-green-500',
  RH:        'bg-purple-500',
  JURIDIQUE: 'bg-amber-500',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

//  Login screen 
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Verify credentials by hitting a protected endpoint
      const { fetchStats: fs } = await import('../api')
      await fetchStats({ username, password })
      onLogin({ username, password })
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Identifiants incorrects.')
      } else {
        setError('Impossible de contacter le serveur.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">Espace Administrateur</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Gestion des candidatures</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Identifiant</label>
            <input className="input-field" value={username}
              onChange={e => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input-field" type="password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

//  Stats bar 
function StatsBar({ stats }) {
  if (!stats) return null
  const labels = {
    TECH: 'Tech', MARKETING: 'Marketing', FINANCE: 'Finance',
    RH: 'RH', JURIDIQUE: 'Juridique',
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="card flex flex-col items-center py-4">
        <span className="text-3xl font-bold text-navy-900">{stats.total}</span>
        <span className="text-xs text-gray-500 mt-1">Total</span>
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat} className="card flex flex-col items-center py-4">
          <div className={`w-2 h-2 rounded-full ${STAT_COLORS[cat]} mb-2`} />
          <span className="text-2xl font-bold text-gray-900">
            {stats.parCategorie?.[cat] ?? 0}
          </span>
          <span className="text-xs text-gray-500 mt-1">{labels[cat]}</span>
        </div>
      ))}
    </div>
  )
}

//  Candidature detail modal 
function DetailModal({ candidature, auth, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const url = await getDownloadUrl(auth, candidature.id)
      window.open(url, '_blank')
    } catch {
      alert('Impossible de générer le lien de téléchargement.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Détail de la candidature</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-navy-700 font-bold text-lg">
                {candidature.prenom[0]}{candidature.nom[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {candidature.prenom} {candidature.nom}
              </p>
              <p className="text-sm text-gray-500">{candidature.email}</p>
              <div className="mt-1"><CategoryBadge category={candidature.categorie} /></div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Téléphone</p>
              <p className="text-gray-800">{candidature.telephone}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-0.5">Date de soumission</p>
              <p className="text-gray-800">{formatDate(candidature.createdAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 font-medium mb-0.5">Poste postulé</p>
              <p className="text-gray-800">{candidature.postePostule}</p>
            </div>
            {candidature.lettreMotivation && (
              <div className="col-span-2">
                <p className="text-gray-400 font-medium mb-0.5">Lettre de motivation</p>
                <p className="text-gray-800 whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-3">
                  {candidature.lettreMotivation}
                </p>
              </div>
            )}
          </div>

          {/* CV download */}
          <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {candidature.cvFilename ?? 'CV'}
                </p>
                <p className="text-xs text-gray-400">Fichier CV</p>
              </div>
            </div>
            <button
              onClick={download}
              disabled={downloading}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Chargement…' : 'Télécharger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

//  Main dashboard 
function Dashboard({ auth, onLogout }) {
  const [candidatures, setCandidatures] = useState([])
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [filterCat, setFilterCat]       = useState('')
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selected, setSelected]         = useState(null)
  const [deleteId, setDeleteId]         = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, s] = await Promise.all([
        fetchCandidatures(auth, { categorie: filterCat || undefined, search, page }),
        fetchStats(auth),
      ])
      setCandidatures(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setStats(s)
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    } finally {
      setLoading(false)
    }
  }, [auth, filterCat, search, page])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteCandidature(auth, deleteId)
      setDeleteId(null)
      load()
    } catch {
      alert('Erreur lors de la suppression.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-sm">Espace Administrateur</h1>
              <p className="text-xs text-white/60">Gestion des candidatures</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/60 hidden sm:block">
              Connecté : <span className="text-white font-medium">{auth.username}</span>
            </span>
            <button
              onClick={onLogout}
              className="text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/50
                         rounded-lg px-3 py-1.5 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Filters */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <input
                className="input-field flex-1"
                placeholder="Rechercher par nom, email, poste…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn-primary px-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilterCat(''); setPage(0) }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
                  ${!filterCat ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-300 text-gray-600 hover:border-navy-500'}`}
              >
                Toutes
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilterCat(cat); setPage(0) }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
                    ${filterCat === cat ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-300 text-gray-600 hover:border-navy-500'}`}
                >
                  {CATEGORY_STYLES[cat]?.label ?? cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter summary */}
          {(search || filterCat) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>{totalElements} résultat{totalElements !== 1 ? 's' : ''}</span>
              {search && (
                <span className="bg-gray-100 rounded px-2 py-0.5 flex items-center gap-1">
                  "{search}"
                  <button onClick={() => { setSearch(''); setSearchInput(''); setPage(0) }}
                    className="text-gray-400 hover:text-gray-700 ml-1">×</button>
                </span>
              )}
              {filterCat && (
                <span className="bg-gray-100 rounded px-2 py-0.5 flex items-center gap-1">
                  {CATEGORY_STYLES[filterCat]?.label}
                  <button onClick={() => { setFilterCat(''); setPage(0) }}
                    className="text-gray-400 hover:text-gray-700 ml-1">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-navy-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : candidatures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">Aucune candidature trouvée</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Candidat', 'Poste', 'Catégorie', 'Date', 'CV', 'Actions'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {candidatures.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-navy-700 font-semibold text-xs">
                                {c.prenom[0]}{c.nom[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
                              <p className="text-xs text-gray-500">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-gray-800 max-w-[180px] truncate">{c.postePostule}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <CategoryBadge category={c.categorie} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500 max-w-[120px] truncate block">
                            {c.cvFilename ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelected(c)}
                              className="text-xs text-navy-500 hover:text-navy-700 font-medium"
                            >
                              Voir
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setDeleteId(c.id)}
                              className="text-xs text-red-400 hover:text-red-600 font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {candidatures.map(c => (
                  <div key={c.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.email}</p>
                        <p className="text-xs text-gray-600 mt-1">{c.postePostule}</p>
                        <div className="mt-2"><CategoryBadge category={c.categorie} /></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setSelected(c)}
                          className="text-xs text-navy-500 font-medium border border-navy-200 rounded px-2 py-1">
                          Voir
                        </button>
                        <button onClick={() => setDeleteId(c.id)}
                          className="text-xs text-red-400 font-medium border border-red-200 rounded px-2 py-1">
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Page {page + 1} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
              >
                ← Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          candidature={selected}
          auth={auth}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Cette action supprimera la candidature et le CV associé de Cloudinary.
              Elle est irréversible.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteId(null)}
                disabled={deleteLoading}>
                Annuler
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6
                           rounded-lg transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

//  Export with auth gate 
export default function AdminDashboard() {
  const [auth, setAuth] = useState(() => {
    const saved = sessionStorage.getItem('admin_auth')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (credentials) => {
    sessionStorage.setItem('admin_auth', JSON.stringify(credentials))
    setAuth(credentials)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setAuth(null)
  }

  if (!auth) return <LoginScreen onLogin={handleLogin} />
  return <Dashboard auth={auth} onLogout={handleLogout} />
}
