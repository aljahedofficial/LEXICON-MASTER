import { readFile } from 'fs/promises'
import pdfParse from 'pdf-parse'
import * as XLSX from 'node-xlsx'
import mammoth from 'mammoth'
import EPub from 'epub'
import Tesseract from 'tesseract.js'

/**
 * Extract text from TXT files
 */
export async function extractTextFromTxt(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath)
    
    // Try UTF-8 first
    let text = buffer.toString('utf-8')
    
    // If contains invalid chars, try Latin1
    if (text.includes('\uFFFD')) {
      text = buffer.toString('latin1')
    }
    
    return text.trim()
  } catch (error) {
    throw new Error(`Error extracting text from TXT: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text with OCR (images/PDFs if supported by Tesseract)
 */
export async function extractTextWithOcr(filePath: string, language: string = 'eng'): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(filePath, language)
    return data.text.trim()
  } catch (error) {
    throw new Error(`Error extracting text with OCR: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from PDF files
 */
export async function extractTextFromPdf(
  filePath: string,
  options: { useOcr?: boolean } = {}
): Promise<string> {
  try {
    const buffer = await readFile(filePath)
    const pdfData = await pdfParse(buffer)
    const extracted = pdfData.text.trim()

    if (options.useOcr && extracted.length < 50) {
      const ocrText = await extractTextWithOcr(filePath)
      return ocrText.trim()
    }

    return extracted
  } catch (error) {
    throw new Error(`Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value.trim()
  } catch (error) {
    throw new Error(`Error extracting text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from DOC files (fallback - limited support)
 * Note: Full DOC support requires additional libraries like mammoth
 */
export async function extractTextFromDoc(filePath: string): Promise<string> {
  try {
    // For basic DOC support, we'll try to extract text as binary
    const buffer = await readFile(filePath)
    let text = ''
    
    // Simple extraction: look for readable ASCII text
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i]
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
        text += String.fromCharCode(byte)
      } else if (byte > 127 && i + 1 < buffer.length) {
        // Skip binary sequences but keep space
        text += ' '
      }
    }
    
    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .split(' ')
      .filter((word) => word.length > 0)
      .join(' ')
      .trim()
    
    if (!text || text.length < 10) {
      throw new Error('Could not extract readable text from DOC file')
    }
    
    return text
  } catch (error) {
    throw new Error(`Error extracting text from DOC: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from XLSX/XLS files
 */
export async function extractTextFromXlsx(filePath: string): Promise<string> {
  try {
    const workSheetsFromFile = XLSX.parse(filePath)
    
    const allText: string[] = []
    
    workSheetsFromFile.forEach((sheet) => {
      allText.push(`\n=== Sheet: ${sheet.name} ===\n`)
      
      sheet.data.forEach((row) => {
        const rowText = (row as Array<unknown>).map((cell) => {
          if (cell === null || cell === undefined) return ''
          return String(cell).trim()
        })
        
        const cleanedRow = rowText.filter((text) => text.length > 0).join(' | ')
        if (cleanedRow) {
          allText.push(cleanedRow)
        }
      })
    })
    
    return allText.join('\n').trim()
  } catch (error) {
    throw new Error(`Error extracting text from XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from EPUB files (basic implementation)
 */
export async function extractTextFromEpub(filePath: string): Promise<string> {
  try {
    const epub = new EPub(filePath)

    return await new Promise<string>((resolve, reject) => {
      const chapters: string[] = []

      epub.on('error', (err) => reject(err))

      epub.on('end', async () => {
        try {
          const flow = epub.flow || []
          for (const chapter of flow) {
            const text = await new Promise<string>((res, rej) => {
              epub.getChapter(chapter.id, (err, content) => {
                if (err) return rej(err)
                const cleaned = String(content || '')
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
                res(cleaned)
              })
            })
            if (text) chapters.push(text)
          }
          resolve(chapters.join('\n'))
        } catch (err) {
          reject(err)
        }
      })

      epub.parse()
    })
  } catch (error) {
    throw new Error(`Error extracting text from EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Route extraction to appropriate handler based on file extension
 */
export async function extractTextFromFile(
  filePath: string,
  fileExtension: string,
  options: { useOcr?: boolean } = {}
): Promise<string> {
  const ext = fileExtension.toLowerCase()
  
  switch (ext) {
    case 'txt':
      return extractTextFromTxt(filePath)
    case 'pdf':
      return extractTextFromPdf(filePath, options)
    case 'docx':
      return extractTextFromDocx(filePath)
    case 'doc':
      return extractTextFromDoc(filePath)
    case 'xlsx':
    case 'xls':
      return extractTextFromXlsx(filePath)
    case 'epub':
      return extractTextFromEpub(filePath)
    case 'png':
    case 'jpg':
    case 'jpeg':
      return extractTextWithOcr(filePath)
    default:
      throw new Error(`Unsupported file extension: ${ext}`)
  }
}
