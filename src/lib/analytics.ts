/**
 * Analytics and metrics calculations for vocabulary analysis
 */

export interface WordFrequencyData {
  word: string
  frequency: number
  wordLength: number
  language?: string
}

export interface AnalyticsMetrics {
  totalWords: number
  totalUniqueWords: number
  averageFrequency: number
  maxFrequency: number
  minFrequency: number
  standardDeviation: number
  averageWordLength: number
  median: number
  mode: number
}

export interface ComplexityMetrics {
  fleschKincaidGrade: number
  lexicalDiversity: number
  typeTokenRatio: number
  uniqueWordRatio: number
  hapaxLegomena: number // Words appearing only once
  hapaxDislegomena: number // Words appearing exactly twice
  simpsonsDiversityIndex: number
  averageFrequencyRank: number
}

/**
 * Calculate basic statistical metrics
 */
export function calculateMetrics(words: WordFrequencyData[]): AnalyticsMetrics {
  if (words.length === 0) {
    return {
      totalWords: 0,
      totalUniqueWords: 0,
      averageFrequency: 0,
      maxFrequency: 0,
      minFrequency: 0,
      standardDeviation: 0,
      averageWordLength: 0,
      median: 0,
      mode: 0,
    }
  }

  const frequencies = words.map((w) => w.frequency)
  const lengths = words.map((w) => w.wordLength)

  // Calculate total word count (sum of all frequencies)
  const totalWords = frequencies.reduce((a, b) => a + b, 0)

  // Basic statistics
  const maxFrequency = Math.max(...frequencies)
  const minFrequency = Math.min(...frequencies)
  const averageFrequency = totalWords / words.length

  // Standard deviation
  const variance =
    frequencies.reduce((sum, freq) => sum + Math.pow(freq - averageFrequency, 2), 0) /
    frequencies.length
  const standardDeviation = Math.sqrt(variance)

  // Average word length
  const averageWordLength = lengths.reduce((a, b) => a + b, 0) / lengths.length

  // Median
  const sortedFreq = [...frequencies].sort((a, b) => a - b)
  const median =
    sortedFreq.length % 2 === 0
      ? (sortedFreq[sortedFreq.length / 2 - 1] + sortedFreq[sortedFreq.length / 2]) / 2
      : sortedFreq[Math.floor(sortedFreq.length / 2)]

  // Mode (most common frequency)
  const freqMap = new Map<number, number>()
  frequencies.forEach((f) => freqMap.set(f, (freqMap.get(f) || 0) + 1))
  const mode = Array.from(freqMap.entries()).reduce((a, b) => (b[1] > a[1] ? b : a))[0]

  return {
    totalWords,
    totalUniqueWords: words.length,
    averageFrequency,
    maxFrequency,
    minFrequency,
    standardDeviation,
    averageWordLength,
    median,
    mode,
  }
}

/**
 * Calculate complexity and richness metrics
 */
export function calculateComplexityMetrics(words: WordFrequencyData[]): ComplexityMetrics {
  if (words.length === 0) {
    return {
      fleschKincaidGrade: 0,
      lexicalDiversity: 0,
      typeTokenRatio: 0,
      uniqueWordRatio: 0,
      hapaxLegomena: 0,
      hapaxDislegomena: 0,
      simpsonsDiversityIndex: 0,
      averageFrequencyRank: 0,
    }
  }

  // Count hapax legomena (words with frequency 1) and dislegomena (frequency 2)
  const hapaxLegomena = words.filter((w) => w.frequency === 1).length
  const hapaxDislegomena = words.filter((w) => w.frequency === 2).length

  // Total word count
  const totalWords = words.reduce((sum, w) => sum + w.frequency, 0)

  // Type-Token Ratio: unique words / total words
  const typeTokenRatio = words.length / totalWords

  // Unique word ratio
  const uniqueWordRatio = words.length / totalWords

  // Simpson's Diversity Index: 1 - Σ(ni/N)²
  let simpsonSum = 0
  for (const word of words) {
    const proportion = word.frequency / totalWords
    simpsonSum += proportion * proportion
  }
  const simpsonsDiversityIndex = 1 - simpsonSum

  // Lexical Diversity: normalized by word count
  const lexicalDiversity = (words.length / Math.sqrt(2 * totalWords)) * 100

  // Flesch-Kincaid Grade Level (simplified, based on word complexity)
  // Using average word length as proxy for syllable count
  // FK = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  // Simplified: FK ≈ average_word_length * 0.5
  const fleschKincaidGrade = Math.max(0, words.reduce((sum, w) => sum + w.wordLength, 0) / words.length / 2)

  // Average frequency rank (for vocabulary level assessment)
  const sortedByFreq = [...words].sort((a, b) => b.frequency - a.frequency)
  const averageFrequencyRank = sortedByFreq.reduce((_sum, _w, idx) => _sum + idx + 1, 0) / words.length

  return {
    fleschKincaidGrade,
    lexicalDiversity,
    typeTokenRatio,
    uniqueWordRatio,
    hapaxLegomena,
    hapaxDislegomena,
    simpsonsDiversityIndex,
    averageFrequencyRank,
  }
}

/**
 * Get frequency distribution buckets (for charting)
 */
export function getFrequencyDistribution(words: WordFrequencyData[]): Array<{ frequency: number; count: number }> {
  if (words.length === 0) return []

  const maxFreq = Math.max(...words.map((w) => w.frequency))
  const bucketSize = Math.max(1, Math.ceil(maxFreq / 10))

  const distribution: Record<number, number> = {}

  for (const word of words) {
    const bucket = Math.floor(word.frequency / bucketSize) * bucketSize
    distribution[bucket] = (distribution[bucket] || 0) + 1
  }

  return Object.entries(distribution)
    .map(([freq, count]) => ({
      frequency: parseInt(freq),
      count,
    }))
    .sort((a, b) => a.frequency - b.frequency)
}

/**
 * Get word length distribution
 */
export function getWordLengthDistribution(words: WordFrequencyData[]): Array<{ length: number; count: number }> {
  if (words.length === 0) return []

  const distribution: Record<number, number> = {}

  for (const word of words) {
    distribution[word.wordLength] = (distribution[word.wordLength] || 0) + 1
  }

  return Object.entries(distribution)
    .map(([length, count]) => ({
      length: parseInt(length),
      count,
    }))
    .sort((a, b) => a.length - b.length)
}

/**
 * Get language distribution
 */
export function getLanguageDistribution(words: WordFrequencyData[]): Array<{ language: string; count: number }> {
  if (words.length === 0) return []

  const distribution: Record<string, number> = {}

  for (const word of words) {
    const lang = word.language || 'unknown'
    distribution[lang] = (distribution[lang] || 0) + 1
  }

  return Object.entries(distribution)
    .map(([language, count]) => ({
      language,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get vocabulary tier distribution (by frequency ranks)
 */
export function getVocabularyTierDistribution(words: WordFrequencyData[]): Array<{ tier: string; count: number }> {
  if (words.length === 0) return []

  const sorted = [...words].sort((a, b) => b.frequency - a.frequency)
  const total = sorted.length

  const tiers = {
    'Very High (Top 10%)': 0,
    'High (11-25%)': 0,
    'Medium (26-50%)': 0,
    'Low (51-75%)': 0,
    'Very Low (76-100%)': 0,
  }

  sorted.forEach((_word, idx) => {
    const percentile = (idx / total) * 100
    if (percentile < 10) {
      tiers['Very High (Top 10%)']++
    } else if (percentile < 25) {
      tiers['High (11-25%)']++
    } else if (percentile < 50) {
      tiers['Medium (26-50%)']++
    } else if (percentile < 75) {
      tiers['Low (51-75%)']++
    } else {
      tiers['Very Low (76-100%)']++
    }
  })

  return Object.entries(tiers)
    .map(([tier, count]) => ({ tier, count }))
    .filter((t) => t.count > 0)
}

/**
 * Calculate percentile rank for a word
 */
export function getPercentileRank(words: WordFrequencyData[], targetWord: string): number {
  const sorted = [...words].sort((a, b) => b.frequency - a.frequency)
  const index = sorted.findIndex((w) => w.word.toLowerCase() === targetWord.toLowerCase())

  if (index === -1) return 0

  return Math.round(((index / sorted.length) * 100 + Number.EPSILON) * 100) / 100
}

/**
 * Format metrics for display
 */
export function formatMetric(value: number, type: 'percentage' | 'decimal' | 'integer' = 'decimal'): string {
  if (type === 'percentage') {
    return `${(value * 100).toFixed(1)}%`
  }
  if (type === 'integer') {
    return Math.round(value).toString()
  }
  return value.toFixed(2)
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function estimatePartOfSpeech(word: string): string {
  const lower = word.toLowerCase()
  if (/(ly)$/.test(lower)) return 'adverb'
  if (/(ing|ed)$/.test(lower)) return 'verb'
  if (/(ous|ful|able|ible|al|ic|ive|less)$/.test(lower)) return 'adjective'
  if (/(tion|ment|ness|ity|ship|ism|age|ance|ence|er|or)$/.test(lower)) return 'noun'
  return 'other'
}

export function getPartOfSpeechDistribution(words: WordFrequencyData[]): Array<{ partOfSpeech: string; count: number }> {
  if (words.length === 0) return []
  const distribution: Record<string, number> = {}
  for (const word of words) {
    const pos = estimatePartOfSpeech(word.word)
    distribution[pos] = (distribution[pos] || 0) + 1
  }
  return Object.entries(distribution)
    .map(([partOfSpeech, count]) => ({ partOfSpeech, count }))
    .sort((a, b) => b.count - a.count)
}

export function getTopWordFrequencies(
  words: WordFrequencyData[],
  limit = 30
): Array<{ word: string; frequency: number }>
{
  return [...words]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)
    .map((w) => ({ word: w.word, frequency: w.frequency }))
}

export function getFrequencyHistogram(
  words: WordFrequencyData[],
  bucketCount = 12
): Array<{ range: string; count: number; mid: number }>
{
  if (words.length === 0) return []
  const maxFreq = Math.max(...words.map((w) => w.frequency))
  const bucketSize = Math.max(1, Math.ceil(maxFreq / bucketCount))
  const buckets: Record<number, number> = {}
  for (const word of words) {
    const bucket = Math.floor(word.frequency / bucketSize) * bucketSize
    buckets[bucket] = (buckets[bucket] || 0) + 1
  }

  return Object.entries(buckets)
    .map(([start, count]) => {
      const startNum = parseInt(start, 10)
      const endNum = startNum + bucketSize
      return {
        range: `${startNum}-${endNum}`,
        count,
        mid: startNum + bucketSize / 2,
      }
    })
    .sort((a, b) => a.mid - b.mid)
}

export function getVocabularyGrowthCurve(
  words: WordFrequencyData[],
  fileCount: number
): Array<{ fileIndex: number; uniqueWords: number }>
{
  if (words.length === 0 || fileCount <= 0) return []
  const buckets = Array.from({ length: fileCount }, () => new Set<string>())
  for (const word of words) {
    const bucketIndex = hashString(word.word) % fileCount
    buckets[bucketIndex].add(word.word)
  }

  const cumulative: Array<{ fileIndex: number; uniqueWords: number }> = []
  const seen = new Set<string>()
  for (let i = 0; i < fileCount; i += 1) {
    for (const word of buckets[i]) {
      seen.add(word)
    }
    cumulative.push({ fileIndex: i + 1, uniqueWords: seen.size })
  }
  return cumulative
}

export function getCumulativeVocabularyStacked(
  words: WordFrequencyData[],
  fileCount: number
): Array<Record<string, number>>
{
  if (words.length === 0 || fileCount <= 0) return []
  const buckets = Array.from({ length: fileCount }, () => new Set<string>())
  for (const word of words) {
    const bucketIndex = hashString(word.word) % fileCount
    buckets[bucketIndex].add(word.word)
  }

  const series: Array<Record<string, number>> = []
  const cumulativeCounts = new Array(fileCount).fill(0)
  for (let i = 0; i < fileCount; i += 1) {
    cumulativeCounts[i] += buckets[i].size
    const point: Record<string, number> = {
      fileIndex: i + 1,
    }
    for (let j = 0; j <= i; j += 1) {
      point[`file_${j + 1}`] = cumulativeCounts[j]
    }
    series.push(point)
  }
  return series
}

export function getDifficultySpectrum(words: WordFrequencyData[]): Array<{ level: string; count: number }> {
  if (words.length === 0) return []
  const sorted = [...words].sort((a, b) => b.frequency - a.frequency)
  const total = sorted.length
  const spectrum = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
  }

  sorted.forEach((_word, idx) => {
    const percentile = (idx / total) * 100
    if (percentile < 33) spectrum.Beginner += 1
    else if (percentile < 66) spectrum.Intermediate += 1
    else spectrum.Advanced += 1
  })

  return Object.entries(spectrum).map(([level, count]) => ({ level, count }))
}

export function getZipfianData(words: WordFrequencyData[]): Array<{ word: string; frequency: number; rank: number }> {
  return [...words]
    .sort((a, b) => b.frequency - a.frequency)
    .map((w, index) => ({ word: w.word, frequency: w.frequency, rank: index + 1 }))
}
