const STATUSES = [
  { value: 'unchecked',     label: 'Not checked', style: 'bg-gray-100 text-gray-500' },
  { value: 'found',         label: 'Found',        style: 'bg-green-100 text-green-700' },
  { value: 'not_found',     label: 'Not found',    style: 'bg-red-100 text-red-600' },
  { value: 'not_available', label: 'Not available', style: 'bg-yellow-100 text-yellow-700' },
]

const TIER_LABELS = {
  1: 'Kutub al-Sittah',
  2: 'Major early collections',
  3: 'Sahihs, Musnads & Mu\'jams',
  4: 'Later reference works',
}

export default function BookChecklist({ books, onStatusChange }) {
  const byTier = [1, 2, 3, 4].map(tier => ({
    tier,
    label: TIER_LABELS[tier],
    books: books.filter(b => b.tier === tier),
  }))

  return (
    <div className="space-y-6">
      {byTier.map(({ tier, label, books: tierBooks }) => (
        <div key={tier}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {label}
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {tierBooks.map(book => {
              const currentStatus = book.status || 'unchecked'
              return (
                <div key={book.id} className="flex items-center justify-between px-4 py-3 gap-4">
                  {/* Book info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" dir="rtl">
                      {book.name_arabic}
                    </p>
                    <p className="text-xs text-gray-400">{book.name_english}</p>
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {STATUSES.map(({ value, label, style }) => (
                      <button
                        key={value}
                        onClick={() => onStatusChange(book.id, value)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          currentStatus === value
                            ? `${style} border-transparent font-medium`
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
