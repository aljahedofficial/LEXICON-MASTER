'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'

export interface TableWord {
  id: string
  word: string
  frequency: number
  wordLength: number
  language?: string
  definition?: string
  partOfSpeech?: string
  synonyms?: string[]
  example?: string
}

interface VocabularyTableProps {
  words: TableWord[]
  loading?: boolean
  onWordClick?: (word: TableWord) => void
  filters?: VocabularyFilters
  onFiltersChange?: (filters: VocabularyFilters) => void
}

export interface VocabularyFilters {
  query: string
  frequency?: { min: number; max: number }
  length?: { min: number; max: number }
  language?: string
}

type SortField = 'word' | 'frequency' | 'wordLength'
type SortDirection = 'asc' | 'desc'

export function VocabularyTable({
  words,
  loading = false,
  onWordClick,
  filters,
  onFiltersChange,
}: VocabularyTableProps) {
  const [internalFilters, setInternalFilters] = useState<VocabularyFilters>({
    query: '',
  })
  const activeFilters = filters ?? internalFilters
  const [searchQuery, setSearchQuery] = useState(activeFilters.query)
  const [sortField, setSortField] = useState<SortField>('frequency')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [frequencyFilter, setFrequencyFilter] = useState<{ min: number; max: number } | null>(
    activeFilters.frequency ?? null
  )
  const [lengthFilter, setLengthFilter] = useState<{ min: number; max: number } | null>(
    activeFilters.length ?? null
  )
  const [languageFilter, setLanguageFilter] = useState<string | null>(
    activeFilters.language ?? null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    if (!filters) return
    setSearchQuery(filters.query || '')
    setFrequencyFilter(filters.frequency ?? null)
    setLengthFilter(filters.length ?? null)
    setLanguageFilter(filters.language ?? null)
    setCurrentPage(1)
  }, [filters])

  const updateFilters = (next: VocabularyFilters) => {
    if (onFiltersChange) {
      onFiltersChange(next)
    }
    if (!filters) {
      setInternalFilters(next)
    }
  }

  // Filter and sort words
  const filteredAndSorted = useMemo(() => {
    let result = [...words]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((w) => w.word.toLowerCase().includes(query))
    }

    // Frequency filter
    if (frequencyFilter) {
      result = result.filter((w) => w.frequency >= frequencyFilter.min && w.frequency <= frequencyFilter.max)
    }

    // Word length filter
    if (lengthFilter) {
      result = result.filter((w) => w.wordLength >= lengthFilter.min && w.wordLength <= lengthFilter.max)
    }

    if (languageFilter) {
      result = result.filter((w) => (w.language || 'en').toLowerCase() === languageFilter.toLowerCase())
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      if (sortField === 'word') {
        aValue = a.word.toLowerCase()
        bValue = b.word.toLowerCase()
      } else if (sortField === 'frequency') {
        aValue = a.frequency
        bValue = b.frequency
      } else {
        aValue = a.wordLength
        bValue = b.wordLength
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue)
      } else {
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
      }
    })

    return result
  }, [words, searchQuery, sortField, sortDirection, frequencyFilter, lengthFilter, languageFilter])

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedWords = filteredAndSorted.slice(startIdx, startIdx + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕'
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading vocabulary...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
        <div>
          <Input
            label="Search Words"
            placeholder="Filter by word..."
            value={searchQuery}
            onChange={(e) => {
              const nextQuery = e.target.value
              setSearchQuery(nextQuery)
              updateFilters({
                query: nextQuery,
                frequency: frequencyFilter ?? undefined,
                length: lengthFilter ?? undefined,
                language: languageFilter ?? undefined,
              })
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <Input
              label="Min Frequency"
              type="number"
              placeholder="Min"
              defaultValue="1"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                const next = {
                  min: val,
                  max: frequencyFilter?.max || 999999,
                }
                setFrequencyFilter(next)
                updateFilters({
                  query: searchQuery,
                  frequency: next,
                  length: lengthFilter ?? undefined,
                  language: languageFilter ?? undefined,
                })
                setCurrentPage(1)
              }}
            />
            <Input
              label="Max Frequency"
              type="number"
              placeholder="Max"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 999999
                const next = {
                  min: frequencyFilter?.min || 0,
                  max: val,
                }
                setFrequencyFilter(next)
                updateFilters({
                  query: searchQuery,
                  frequency: next,
                  length: lengthFilter ?? undefined,
                  language: languageFilter ?? undefined,
                })
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              label="Min Length"
              type="number"
              placeholder="Min"
              defaultValue="1"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                const next = {
                  min: val,
                  max: lengthFilter?.max || 999,
                }
                setLengthFilter(next)
                updateFilters({
                  query: searchQuery,
                  frequency: frequencyFilter ?? undefined,
                  length: next,
                  language: languageFilter ?? undefined,
                })
                setCurrentPage(1)
              }}
            />
            <Input
              label="Max Length"
              type="number"
              placeholder="Max"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 999
                const next = {
                  min: lengthFilter?.min || 0,
                  max: val,
                }
                setLengthFilter(next)
                updateFilters({
                  query: searchQuery,
                  frequency: frequencyFilter ?? undefined,
                  length: next,
                  language: languageFilter ?? undefined,
                })
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
            <select
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={languageFilter ?? ''}
              onChange={(e) => {
                const next = e.target.value || null
                setLanguageFilter(next)
                updateFilters({
                  query: searchQuery,
                  frequency: frequencyFilter ?? undefined,
                  length: lengthFilter ?? undefined,
                  language: next ?? undefined,
                })
                setCurrentPage(1)
              }}
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="bn">Bangla</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
        {(searchQuery || frequencyFilter || lengthFilter || languageFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setFrequencyFilter(null)
              setLengthFilter(null)
              setLanguageFilter(null)
              updateFilters({ query: '' })
              setCurrentPage(1)
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredAndSorted.length)} of{' '}
        {filteredAndSorted.length} words
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
              <th
                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('word')}
              >
                Word{getSortIndicator('word')}
              </th>
              <th
                className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('frequency')}
              >
                Frequency{getSortIndicator('frequency')}
              </th>
              <th
                className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('wordLength')}
              >
                Length{getSortIndicator('wordLength')}
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Language</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWords.map((word, idx) => (
              <tr
                key={word.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => onWordClick?.(word)}
              >
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{startIdx + idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{word.word}</td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{word.frequency}</td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{word.wordLength}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {word.language || 'EN'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedWords.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No words found matching your filters
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}
