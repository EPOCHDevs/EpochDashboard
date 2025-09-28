import { TearSheet, TearSheetClass } from '../types/proto'

/**
 * Download tearsheet data as a proto file
 * @param tearsheet - The tearsheet data to download
 * @param format - The format to download (only 'proto' supported)
 * @param filename - The filename without extension
 */
export function downloadTearsheet(
  tearsheet: TearSheet,
  format: 'proto' = 'proto',
  filename: string = 'tearsheet'
) {
  try {
    // Proto only - no JSON!
    const uint8Array = TearSheetClass.encode(tearsheet).finish()
    // Convert to regular ArrayBuffer for Blob
    const buffer = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength)
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const extension = '.pb'

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}${extension}`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download tearsheet:', error)
    throw error
  }
}

/**
 * Read tearsheet data from a proto file
 * @param file - The file to read
 * @returns Promise resolving to the tearsheet data
 */
export async function readTearsheetFile(file: File): Promise<TearSheet> {
  const filename = file.name.toLowerCase()

  if (
    filename.endsWith('.pb') ||
    filename.endsWith('.proto') ||
    filename.endsWith('.bin')
  ) {
    // Read as protobuf binary ONLY - no JSON!
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    return TearSheetClass.decode(uint8Array) as TearSheet
  } else {
    throw new Error(
      'Unsupported file format. Please upload a .pb/.proto/.bin file (Proto only)'
    )
  }
}