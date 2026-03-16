'use client'

import { useState, useCallback } from 'react'
import { MapConfigPanel } from '@/components/map-config-panel'
import { NoteVisualizer } from '@/components/note-visualizer'
import { generateNotes, type MapConfig, type Note } from '@/lib/beat-saber-generator'
import { createBeatSaberZip, downloadBlob } from '@/lib/zip-utils'

const defaultConfig: MapConfig = {
  bpm: 128,
  songName: 'My Custom Song',
  songSubName: '',
  songAuthorName: 'Unknown Artist',
  levelAuthorName: 'Map Generator',
  duration: 120,
  difficulty: 'ExpertPlus'
}

export default function BeatSaberGenerator() {
  const [config, setConfig] = useState<MapConfig>(defaultConfig)
  const [notes, setNotes] = useState<Note[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setIsPlaying(false)
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const generatedNotes = generateNotes(config)
      setNotes(generatedNotes)
      setIsGenerating(false)
    }, 100)
  }, [config])

  const handleDownload = useCallback(async () => {
    if (notes.length === 0) return
    
    try {
      const zipBlob = await createBeatSaberZip(config, notes)
      const sanitizedName = config.songName.replace(/[^a-zA-Z0-9]/g, '_')
      downloadBlob(zipBlob, `${sanitizedName}_${config.difficulty}.zip`)
    } catch (error) {
      console.error('Failed to create zip:', error)
    }
  }, [config, notes])

  const handlePlayToggle = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff2d55] to-[#007aff] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Beat Saber Map Generator</h1>
              <p className="text-xs text-muted-foreground">Create custom maps with procedural note generation</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff2d55]" />
              <span className="text-muted-foreground">Red Saber</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#007aff]" />
              <span className="text-muted-foreground">Blue Saber</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 min-h-[calc(100vh-140px)]">
          {/* Config Panel */}
          <aside className="order-2 lg:order-1">
            <MapConfigPanel
              config={config}
              onConfigChange={setConfig}
              onGenerate={handleGenerate}
              onDownload={handleDownload}
              isGenerating={isGenerating}
              hasNotes={notes.length > 0}
            />
          </aside>

          {/* Visualizer */}
          <section className="order-1 lg:order-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Note Preview</h2>
                <p className="text-xs text-muted-foreground">
                  {notes.length > 0 
                    ? `${notes.length} notes generated • ${(config.duration / 60).toFixed(1)} minutes`
                    : 'Generate a map to preview notes'
                  }
                </p>
              </div>
              
              {notes.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-secondary">{config.difficulty}</span>
                  <span className="px-2 py-1 rounded bg-secondary">{config.bpm} BPM</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              {notes.length > 0 ? (
                <NoteVisualizer
                  notes={notes}
                  bpm={config.bpm}
                  isPlaying={isPlaying}
                  onPlayToggle={handlePlayToggle}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Map Generated</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Configure your map settings and click &quot;Generate Map&quot; to create a procedurally generated Beat Saber map.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">Flow Logic</div>
                      <p className="text-xs text-muted-foreground">Alternating swing patterns for comfortable gameplay</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">No Hot Starts</div>
                      <p className="text-xs text-muted-foreground">First note appears at least 1.5s into the song</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">BeatSaver Ready</div>
                      <p className="text-xs text-muted-foreground">Valid v2.0.0 schema with all required files</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">Complete Package</div>
                      <p className="text-xs text-muted-foreground">Includes cover.png and placeholder song.ogg</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-4 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Beat Saber Map Generator • Exports BeatSaver-compatible .zip files</p>
          <p>Replace song.ogg and cover.png with your own files before uploading</p>
        </div>
      </footer>
    </main>
  )
}
