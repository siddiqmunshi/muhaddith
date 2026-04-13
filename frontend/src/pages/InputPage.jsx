import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BookChecklist from '../components/input/BookChecklist'
import ChainSection from '../components/input/ChainSection'

export default function InputPage() {
  const { projectId, hadithId } = useParams()
  const navigate = useNavigate()

  const [hadith, setHadith] = useState(null)
  const [bookStatuses, setBookStatuses] = useState([]) // all books + their status for this hadith
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchHadith(), fetchBookStatuses()]).finally(() => setLoading(false))
  }, [hadithId])

  async function fetchHadith() {
    const res = await fetch(`/api/hadiths/${hadithId}`)
    setHadith(await res.json())
  }

  async function fetchBookStatuses() {
    const res = await fetch(`/api/hadiths/${hadithId}/books`)
    setBookStatuses(await res.json())
  }

  async function updateBookStatus(bookId, status) {
    const res = await fetch(`/api/hadiths/${hadithId}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, status }),
    })
    const updated = await res.json()
    setBookStatuses(prev =>
      prev.map(b => b.id === bookId ? { ...b, ...updated, status } : b)
    )
  }

  const foundBooks = bookStatuses.filter(b => b.status === 'found')

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{hadith?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mark each book below, then enter the chain and matn for books where the hadith was found.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${projectId}/hadiths/${hadithId}/diagram`)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          View diagram
        </button>
      </div>

      {/* Book checklist */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Book checklist</h2>
        <BookChecklist books={bookStatuses} onStatusChange={updateBookStatus} />
      </section>

      {/* Chain + matn entry — one section per found book */}
      {foundBooks.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-base font-semibold text-gray-700">Chains and matn</h2>
          {foundBooks.map(book => (
            <ChainSection
              key={book.id}
              book={book}
              hadithId={hadithId}
              onMatnSaved={(matn) =>
                setBookStatuses(prev =>
                  prev.map(b => b.id === book.id ? { ...b, matn_arabic: matn } : b)
                )
              }
            />
          ))}
        </section>
      )}
    </div>
  )
}
