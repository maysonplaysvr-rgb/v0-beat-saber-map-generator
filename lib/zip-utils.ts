// ZIP file creation utilities using JSZip
import JSZip from 'jszip'
import type { MapConfig, Note, LightshowConfig } from './beat-saber-generator'
import {
  generateInfoDat,
  generateDifficultyDat,
  generatePlaceholderCover,
  generatePlaceholderOgg
} from './beat-saber-generator'

export interface CustomFiles {
  songFile: File | null
  coverFile: File | null
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export async function createBeatSaberZip(
  config: MapConfig,
  notes: Note[],
  lightshowConfig: LightshowConfig,
  customFiles: CustomFiles
): Promise<Blob> {
  const zip = new JSZip()
  
  // Add info.dat
  const infoDat = generateInfoDat(config)
  zip.file('info.dat', JSON.stringify(infoDat, null, 2))
  
  // Add difficulty file with lightshow events
  const difficultyDat = generateDifficultyDat(notes, lightshowConfig, config.bpm)
  zip.file(`${config.difficulty}Standard.dat`, JSON.stringify(difficultyDat, null, 2))
  
  // Add cover image (custom or placeholder)
  if (customFiles.coverFile) {
    const coverBuffer = await fileToArrayBuffer(customFiles.coverFile)
    zip.file('cover.png', coverBuffer)
  } else {
    const coverImage = generatePlaceholderCover()
    zip.file('cover.png', coverImage)
  }
  
  // Add song file (custom or placeholder)
  if (customFiles.songFile) {
    const songBuffer = await fileToArrayBuffer(customFiles.songFile)
    // Keep original extension or convert name
    const originalName = customFiles.songFile.name
    const extension = originalName.split('.').pop()?.toLowerCase()
    
    // BeatSaver expects .ogg or .egg
    if (extension === 'ogg' || extension === 'egg') {
      zip.file(`song.${extension}`, songBuffer)
    } else {
      // Include as song.ogg but note it may need conversion
      zip.file('song.ogg', songBuffer)
    }
  } else {
    const songFile = generatePlaceholderOgg()
    zip.file('song.ogg', songFile)
  }
  
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

// Get audio duration from file
export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio file'))
    })
    
    audio.src = url
  })
}
