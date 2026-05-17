import { useState } from 'react'
import { submitCandidature } from '../api'
import FileUpload from '../components/FileUpload'
import CategoryBadge from '../components/CategoryBadge'

const INITIAL = {
  nom: '', prenom: '', email: '', telephone: '',
  postePostule: '', lettreMotivation: '',
}

const STEPS = [
  { id: 1, title: 'Informations personnelles' },
  { id: 2, title: 'Poste & Motivation' },
  { id: 3, title: 'Téléchargement du CV' },
]

function validate(step, form, cvFile) {
  const errors = {}
  if (step === 1) {
    if (!form.nom.trim())     errors.nom     = 'Le nom est obligatoire.'
    if (!form.prenom.trim())  errors.prenom  = 'Le prénom est obligatoire.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Email invalide.'
    if (!form.telephone.trim() || !/^[+]?[0-9 \-().]{7,20}$/.test(form.telephone))
      errors.telephone = 'Numéro de téléphone invalide.'
  }
  if (step === 2) {
    if (!form.postePostule.trim())
      errors.postePostule = 'Le poste postulé est obligatoire.'
    if (form.lettreMotivation.length > 1000)
      errors.lettreMotivation = 'La lettre ne doit pas dépasser 1000 caractères.'
  }
  if (step === 3) {
    if (!cvFile) errors.cv = 'Veuillez joindre votre CV.'
  }
  return errors
}

export default function FormulaireSubmission() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL)
  const [cvFile, setCvFile] = useState(null)
  const [cvError, setCvError] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const next = () => {
    const errs = validate(step, form, cvFile)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const back = () => { setErrors({}); setStep(s => s - 1) }

  const handleSubmit = async () => {
    const errs = validate(3, form, cvFile)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setSubmitError(null)
    try {
      const res = await submitCandidature(form, cvFile)
      setResult(res)
    } catch (err) {
      const msg = err.response?.data?.erreur ?? 'Une erreur est survenue. Veuillez réessayer.'
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  //  Success screen 
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidature envoyée !</h2>
          <p className="text-gray-600 mb-4">{result.message}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Votre CV a été classifié dans la catégorie</p>
            <CategoryBadge category={result.categorie} size="lg" />
          </div>
          <button className="btn-secondary" onClick={() => { setResult(null); setForm(INITIAL); setCvFile(null); setStep(1) }}>
            Soumettre une autre candidature
          </button>
        </div>
      </div>
    )
  }

  //  Form 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-navy-50 to-white">
      {/* Header */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900">Soumission de Candidature</h1>
            <p className="text-sm text-gray-500">Formulaire avec dépôt de CV via QR code</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-navy-500 text-white' :
                    'bg-gray-200 text-gray-500'}`}>
                  {step > s.id
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    : s.id}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block
                  ${step === s.id ? 'text-navy-500' : 'text-gray-400'}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="card w-full max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          Étape {step} — {STEPS[step - 1].title}
        </h2>

        {/* ── Step 1: Personal info ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nom *</label>
                <input className="input-field" placeholder="Konan" value={form.nom} onChange={set('nom')} />
                {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
              </div>
              <div>
                <label className="label">Prénom *</label>
                <input className="input-field" placeholder="Kouamé" value={form.prenom} onChange={set('prenom')} />
                {errors.prenom && <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>}
              </div>
            </div>
            <div>
              <label className="label">Adresse email *</label>
              <input className="input-field" type="email" placeholder="kouame@example.com"
                value={form.email} onChange={set('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Téléphone *</label>
              <input className="input-field" placeholder="+225 07 00 00 00 00"
                value={form.telephone} onChange={set('telephone')} />
              {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>}
            </div>
          </div>
        )}

        {/* ── Step 2: Post & motivation ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Poste postulé *</label>
              <input className="input-field" placeholder="Ex: Développeur Fullstack, Comptable, Juriste..."
                value={form.postePostule} onChange={set('postePostule')} />
              {errors.postePostule && <p className="mt-1 text-xs text-red-600">{errors.postePostule}</p>}
              <p className="mt-1.5 text-xs text-gray-400">
                Votre CV sera automatiquement classifié selon ce poste.
              </p>
            </div>

            {/* Live category preview */}
            {form.postePostule.trim().length > 2 && (
              <div className="bg-navy-50 rounded-lg p-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Catégorie détectée :</span>
                <CategoryBadge category={predictCategory(form.postePostule)} />
              </div>
            )}

            <div>
              <label className="label">Lettre de motivation <span className="text-gray-400 font-normal">(facultatif)</span></label>
              <textarea
                className="input-field resize-none"
                rows={5}
                placeholder="Décrivez brièvement votre motivation..."
                value={form.lettreMotivation}
                onChange={set('lettreMotivation')}
                maxLength={1000}
              />
              <div className="flex justify-between mt-1">
                {errors.lettreMotivation
                  ? <p className="text-xs text-red-600">{errors.lettreMotivation}</p>
                  : <span />}
                <span className="text-xs text-gray-400">{form.lettreMotivation.length}/1000</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: CV upload ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <FileUpload
              value={cvFile}
              onChange={(file, err) => { setCvFile(file); setCvError(err); setErrors(e => ({ ...e, cv: err })) }}
              error={errors.cv || cvError}
            />
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation component */}
        <div className="flex justify-between mt-8">
          {step > 1
            ? <button className="btn-secondary" onClick={back} disabled={loading}>Retour</button>
            : <span />}
          {step < 3
            ? <button className="btn-primary" onClick={next}>Continuer →</button>
            : <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Envoi en cours…
                  </span>
                ) : 'Soumettre ma candidature'}
              </button>}
        </div>
      </div>
    </div>
  )
}

// Client-side category preview (mirrors backend logic)
function predictCategory(poste) {
  const p = poste.toLowerCase()
  const rules = [
    ['TECH',      ['développeur','developer','devops','data','cloud','software','tech','web','mobile','flutter','react','java','python','informatique','it','ia','ai','réseau','systeme']],
    ['MARKETING', ['marketing','communication','brand','seo','social media','community','content','publicité','commercial','vente','sales','growth','e-commerce']],
    ['FINANCE',   ['finance','comptable','comptabilité','audit','trésorier','fiscal','budget','banque','banking','analyste financier','paie','payroll','risk']],
    ['RH',        ['ressources humaines','rh','recrutement','formation','talent','hr','hrbp','drh','onboarding','sirh','rémunération']],
    ['JURIDIQUE', ['juridique','juriste','avocat','droit','legal','compliance','conformité','contrat','réglementation','rgpd','notaire']],
  ]
  for (const [cat, kws] of rules) {
    if (kws.some(kw => p.includes(kw))) return cat
  }
  return 'TECH'
}
