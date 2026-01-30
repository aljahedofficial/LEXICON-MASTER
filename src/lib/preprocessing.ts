import { franc } from 'franc'

/**
 * Text Preprocessing Pipeline
 * Cleans and normalizes extracted text for vocabulary extraction
 */

// Common stop words in English
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
  'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'will', 'with', 'you', 'your', 'i',
  'me', 'we', 'us', 'him', 'her', 'them', 'this', 'that', 'these', 'those', 'what', 'which',
  'who', 'where', 'when', 'why', 'how', 'am', 'do', 'does', 'did', 'have', 'had', 'having',
  'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'been', 'being', 'then', 'there', 'about',
  'after', 'before', 'above', 'below', 'between', 'during', 'through', 'without', 'against',
  'among', 'into', 'within', 'out', 'off', 'up', 'down', 'if', 'because', 'while', 'until',
  'unless', 'before', 'after', 'since', 'now', 'here', 'there', 'now', 'then', 'once', 'most',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'should', 'could', 'ought', 'may', 'might', 'must', 'can', 'shall',
])

const BENGALI_STOP_WORDS = new Set([
  'এই', 'ওই', 'তা', 'তাঁর', 'তিনি', 'তারা', 'আমরা', 'আমি', 'আপনি', 'তুমি', 'তোমরা', 'আমার', 'তোমার',
  'এটা', 'ওটা', 'যে', 'যা', 'কেন', 'কিভাবে', 'কখন', 'কোথায়', 'এবং', 'অথবা', 'কিন্তু', 'যদি', 'কারণ',
  'যখন', 'যখনই', 'তার', 'ওদের', 'সঙ্গে', 'জন্য', 'উপর', 'নিচে', 'ভিতরে', 'বাইরে', 'হয়', 'ছিল', 'হবে',
  'না', 'হ্যাঁ', 'আর', 'তবে', 'থেকে', 'পর্যন্ত', 'মধ্যে', 'কাছে', 'প্রতি', 'সময়', 'এখন', 'তখন',
])

export type DetectedLanguage = 'en' | 'bn' | 'unknown'

export function detectLanguage(text: string): DetectedLanguage {
  const code = franc(text || '', { minLength: 20 })
  if (code === 'ben') return 'bn'
  if (code === 'eng') return 'en'
  return 'unknown'
}

export function getStopWords(language: DetectedLanguage): Set<string> {
  if (language === 'bn') return BENGALI_STOP_WORDS
  return STOP_WORDS
}

/**
 * Remove special characters and URLs
 */
export function removeSpecialCharacters(text: string): string {
  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '')
  
  // Remove email addresses
  text = text.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '')
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '')
  
  // Remove special characters but keep apostrophes, hyphens in words
  text = text.replace(/[^\w\s'-]/g, ' ')
  
  return text
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(text: string): string {
  // Remove extra spaces, tabs, newlines
  return text
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Convert to lowercase for consistency
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase()
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Split on periods, exclamation marks, question marks
  const sentences = text.split(/[.!?]+/)
  
  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * Split text into words/tokens
 */
export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0)
}

/**
 * Extract unique words, removing stop words
 */
export function extractUniqueWords(
  text: string,
  removeStopWords: boolean = true,
  minLength: number = 3,
  stopWords?: Set<string>
): string[] {
  const words = tokenize(text.toLowerCase())
  const uniqueWords = new Set<string>()
  const activeStopWords = stopWords || STOP_WORDS
  
  words.forEach((word) => {
    // Remove punctuation from word
    const cleanWord = word.replace(/[^\w'-]/g, '')
    
    if (
      cleanWord.length >= minLength &&
      (!removeStopWords || !activeStopWords.has(cleanWord))
    ) {
      uniqueWords.add(cleanWord)
    }
  })
  
  return Array.from(uniqueWords).sort()
}

/**
 * Remove duplicate lines
 */
export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n')
  const uniqueLines = Array.from(new Set(lines))
  return uniqueLines.join('\n')
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  
  // Try to cut at a word boundary
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Main preprocessing pipeline
 */
export interface PreprocessingOptions {
  removeSpecialChars?: boolean
  normalizeWhitespace?: boolean
  toLowerCase?: boolean
  removeDuplicateLines?: boolean
  removeStopWords?: boolean
  minWordLength?: number
  maxLength?: number
}

export function preprocessText(
  text: string,
  options: PreprocessingOptions = {}
): string {
  const {
    removeSpecialChars = true,
    normalizeWhitespace: shouldNormalizeWhitespace = true,
    toLowerCase: shouldLowerCase = true,
    removeDuplicateLines: shouldRemoveDuplicates = false,
    maxLength,
  } = options
  
  let processed = text
  
  if (removeSpecialChars) {
    processed = removeSpecialCharacters(processed)
  }
  
  if (shouldNormalizeWhitespace) {
    processed = normalizeWhitespace(processed)
  }
  
  if (shouldLowerCase) {
    processed = toLowerCase(processed)
  }
  
  if (shouldRemoveDuplicates) {
    processed = removeDuplicateLines(processed)
  }
  
  if (maxLength) {
    processed = truncateText(processed, maxLength)
  }
  
  return processed
}

/**
 * Extract vocabulary words from text
 */
export interface VocabularyExtraction {
  words: string[]
  wordCount: number
  uniqueWordCount: number
  sentences: string[]
  sentenceCount: number
}

export function extractVocabulary(text: string): VocabularyExtraction {
  const processed = preprocessText(text, {
    removeSpecialChars: true,
    normalizeWhitespace: true,
    toLowerCase: true,
  })
  
  const words = extractUniqueWords(processed, true, 3)
  const allWords = tokenize(processed)
  const sentences = splitIntoSentences(text)
  
  return {
    words,
    wordCount: allWords.length,
    uniqueWordCount: words.length,
    sentences: sentences.filter((s) => s.length > 10),
    sentenceCount: sentences.length,
  }
}
