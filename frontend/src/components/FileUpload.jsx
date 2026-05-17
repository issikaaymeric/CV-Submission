import { useRef, useState } from 'react'

const ACCEPTED = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
}

export default function FileUpload({ value, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!Object.keys(ACCEPTED).includes(file.type)) {
      onChange(null, 'Format non accepté. Veuillez soumettre un fichier PDF ou DOCX.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      onChange(null, 'Le fichier ne doit pas dépasser 10 MB.')
      return
    }
    onChange(file, null)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
          ${dragging ? 'border-navy-500 bg-navy-50' : 'border-gray-300 hover:border-navy-500 hover:bg-gray-50'}
          ${error ? 'border-red-400 bg-red-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {value ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-navy-900">{value.name}</p>
            <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(0)} KB</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null, null) }}
              className="text-xs text-red-500 hover:text-red-700 underline mt-1"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              Glissez votre CV ici ou <span className="text-navy-500">cliquez pour parcourir</span>
            </p>
            <p className="text-xs text-gray-400">PDF ou DOCX — max 10 MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
