const STATUS_CONFIG = {
  found:         { label: 'Found',         icon: '✓', style: 'text-green-700 bg-green-50' },
  not_found:     { label: 'Not found',     icon: '✗', style: 'text-red-600   bg-red-50'   },
  not_available: { label: 'Not available', icon: '○', style: 'text-yellow-700 bg-yellow-50' },
  unchecked:     { label: 'Not checked',   icon: '—', style: 'text-gray-400  bg-gray-50'  },
}

const TIER_LABELS = {
  1: 'Kutub al-Sittah',
  2: 'Major early collections',
  3: 'Sahihs, Musnads & Mu\'jams',
  4: 'Later reference works',
}

export default function BookStatusTable({ books }) {
  const byTier = [1, 2, 3, 4].map(tier => ({
    tier,
    label: TIER_LABELS[tier],
    books: books.filter(b => b.tier === tier),
  }))

  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Book checklist</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {byTier.map(({ tier, label, books: tierBooks }) => (
          <div key={tier}>
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
              {label}
            </p>
            {tierBooks.map(book => {
              const cfg = STATUS_CONFIG[book.status || 'unchecked']
              return (
                <div key={book.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <p className="text-xs text-gray-700 truncate" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                    {book.name_arabic}
                  </p>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.style}`}>
                    <span>{cfg.icon}</span>
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
