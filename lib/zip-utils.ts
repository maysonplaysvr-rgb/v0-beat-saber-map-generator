// ZIP file creation utilities using JSZip
import JSZip from 'jszip'
import type { MapConfig, Note } from './beat-saber-generator'
import {
  generateInfoDat,
  generateDifficultyDat,
  generatePlaceholderCover,
  generatePlaceholderOgg
} from './beat-saber-generator'

export async function createBeatSaberZip(
  config: MapConfig,
  notes: Note[]
): Promise<Blob> {
  const zip = new JSZip()
  
  // Add info.dat
  const infoDat = generateInfoDat(config)
  zip.file('info.dat', JSON.stringify(infoDat, null, 2))
  
  // Add difficulty file
  const difficultyDat = generateDifficultyDat(notes)
  zip.file(`${config.difficulty}Standard.dat`, JSON.stringify(difficultyDat, null, 2))
  
  // Add placeholder cover image
  const coverImage = generatePlaceholderCover()
  zip.file('cover.png', coverImage)
  
  // Add placeholder song file
  const songFile = generatePlaceholderOgg()
  zip.file('song.ogg', songFile)
  
  // Generate the zip blob
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
