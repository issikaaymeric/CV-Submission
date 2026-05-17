const CATEGORY_STYLES = {
  TECH:       { label: 'Technologie',         cls: 'bg-blue-100 text-blue-800' },
  MARKETING:  { label: 'Marketing',            cls: 'bg-pink-100 text-pink-800' },
  FINANCE:    { label: 'Finance',              cls: 'bg-green-100 text-green-800' },
  RH:         { label: 'Ressources Humaines',  cls: 'bg-purple-100 text-purple-800' },
  JURIDIQUE:  { label: 'Juridique',            cls: 'bg-amber-100 text-amber-800' },
}

export default function CategoryBadge({ category, size = 'sm' }) {
  const { label, cls } = CATEGORY_STYLES[category] ?? { label: category, cls: 'bg-gray-100 text-gray-700' }
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2 py-0.5 text-xs font-medium'
  return (
    <span className={`inline-flex items-center rounded-full ${sizeClass} ${cls}`}>
      {label}
    </span>
  )
}

export { CATEGORY_STYLES }
