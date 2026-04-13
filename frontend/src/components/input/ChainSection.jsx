import { useState } from 'react'
import FreeTextInput from './FreeTextInput'
import StructuredInput from './StructuredInput'
import FileImport from './FileImport'
import SunnahApiSearch from './SunnahApiSearch'
import MatnInput from './MatnInput'
import ChainDisplay from './ChainDisplay'

const MODES = [
  { value: 'freetext', label: 'Free text' },
  { value: 'structured', label: 'Form' },
  { value: 'file', label: 'File import' },
  { value: 'api', label: 'sunnah.com' },
]

export default function ChainSection({ book, hadithId, onMatnSaved }) {
  const [mode, setMode] = useState('freetext')
  const [chain, setChain] = useState([]) // array of narrator objects

  const hadithBookId = book.hadith_book_id

  function handleChainSaved(narrators) {
    setChain(narrators)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Book header */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 text-sm" dir="rtl">{book.name_arabic}</p>
          <p className="text-xs text-gray-400">{book.name_english}</p>
        </div>
        {/* Input mode tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                mode === m.value
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Chain input — mode dependent */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Isnad chain
          </p>
          {mode === 'freetext' && (
            <FreeTextInput hadithBookId={hadithBookId} onChainSaved={handleChainSaved} />
          )}
          {mode === 'structured' && (
            <StructuredInput hadithBookId={hadithBookId} onChainSaved={handleChainSaved} />
          )}
          {mode === 'file' && (
            <FileImport hadithBookId={hadithBookId} onChainSaved={handleChainSaved} />
          )}
          {mode === 'api' && (
            <SunnahApiSearch
              hadithBookId={hadithBookId}
              bookShortCode={book.short_code}
              onChainSaved={handleChainSaved}
              onMatnFound={(matn) => onMatnSaved(matn)}
            />
          )}
        </div>

        {/* Chain display — shown when chain has narrators */}
        {chain.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Chain preview
            </p>
            <ChainDisplay chain={chain} />
          </div>
        )}

        {/* Matn */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Matn (hadith text)
          </p>
          <MatnInput
            hadithBookId={hadithBookId}
            initialValue={book.matn_arabic || ''}
            onSaved={onMatnSaved}
          />
        </div>
      </div>
    </div>
  )
}
