'use client'

import { useState, useCallback } from 'react'
import { MapConfigPanel } from '@/components/map-config-panel'
import { FileUploadPanel } from '@/components/file-upload-panel'
import { LightshowPanel } from '@/components/lightshow-panel'
import { NoteVisualizer } from '@/components/note-visualizer'
import { 
  generateNotes,
  generateLightEvents,
  type MapConfig, 
  type Note,
  type LightEvent,
  type LightshowConfig,
  defaultLightshowConfig 
} from '@/lib/beat-saber-generator'
import { createBeatSaberZip, downloadBlob, getAudioDuration } from '@/lib/zip-utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Music, Lightbulb } from 'lucide-react'

const defaultConfig: MapConfig = {
  bpm: 128,
  songName: 'My Custom Song',
  songSubName: '',
  songAuthorName: 'Unknown Artist',
  levelAuthorName: 'Map Generator',
  duration: 120,
  difficulty: 'ExpertPlus',
  environment: 'DefaultEnvironment'
}

export default function BeatSaberGenerator() {
  const [config, setConfig] = useState<MapConfig>(defaultConfig)
  const [lightshowConfig, setLightshowConfig] = useState<LightshowConfig>(defaultLightshowConfig)
  const [notes, setNotes] = useState<Note[]>([])
  const [lightEvents, setLightEvents] = useState<LightEvent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // File upload state
  const [songFile, setSongFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [songDuration, setSongDuration] = useState<number | null>(null)

  // Handle song file change and auto-detect duration
  const handleSongChange = useCallback(async (file: File | null) => {
    setSongFile(file)
    
    if (file) {
      try {
        const duration = await getAudioDuration(file)
        setSongDuration(duration)
        // Auto-update map duration to match song
        setConfig(prev => ({ ...prev, duration: Math.floor(duration) }))
      } catch {
        setSongDuration(null)
      }
    } else {
      setSongDuration(null)
    }
  }, [])

  // Handle cover file change
  const handleCoverChange = useCallback((file: File | null, preview: string | null) => {
    setCoverFile(file)
    setCoverPreview(preview)
  }, [])

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    setIsPlaying(false)
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const generatedNotes = generateNotes(config)
      setNotes(generatedNotes)
      
      // Generate light events if enabled
      if (lightshowConfig.enabled) {
        const events = generateLightEvents(generatedNotes, lightshowConfig, config.bpm)
        setLightEvents(events)
      } else {
        setLightEvents([])
      }
      
      setIsGenerating(false)
    }, 100)
  }, [config, lightshowConfig])

  const handleDownload = useCallback(async () => {
    if (notes.length === 0) return
    
    try {
      const zipBlob = await createBeatSaberZip(
        config, 
        notes, 
        lightshowConfig,
        { songFile, coverFile }
      )
      const sanitizedName = config.songName.replace(/[^a-zA-Z0-9]/g, '_')
      downloadBlob(zipBlob, `${sanitizedName}_${config.difficulty}.zip`)
    } catch (error) {
      console.error('Failed to create zip:', error)
    }
  }, [config, notes, lightshowConfig, songFile, coverFile])

  const handlePlayToggle = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Calculate stats
  const lightEventCount = lightEvents.length

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
        <div className="grid lg:grid-cols-[420px_1fr] gap-6 min-h-[calc(100vh-140px)]">
          {/* Config Panels */}
          <aside className="order-2 lg:order-1 space-y-4">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary">
                <TabsTrigger value="config" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Music className="w-4 h-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger value="lights" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Lights</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="mt-4">
                <MapConfigPanel
                  config={config}
                  onConfigChange={setConfig}
                  onGenerate={handleGenerate}
                  onDownload={handleDownload}
                  isGenerating={isGenerating}
                  hasNotes={notes.length > 0}
                />
              </TabsContent>
              
              <TabsContent value="media" className="mt-4">
                <FileUploadPanel
                  songFile={songFile}
                  coverFile={coverFile}
                  coverPreview={coverPreview}
                  onSongChange={handleSongChange}
                  onCoverChange={handleCoverChange}
                  songDuration={songDuration}
                />
              </TabsContent>
              
              <TabsContent value="lights" className="mt-4">
                <LightshowPanel
                  config={lightshowConfig}
                  onConfigChange={setLightshowConfig}
                />
              </TabsContent>
            </Tabs>
          </aside>

          {/* Visualizer */}
          <section className="order-1 lg:order-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Note Preview</h2>
                <p className="text-xs text-muted-foreground">
                  {notes.length > 0 
                    ? `${notes.length} notes • ~${lightEventCount} light events • ${(config.duration / 60).toFixed(1)} min`
                    : 'Generate a map to preview notes'
                  }
                </p>
              </div>
              
              {notes.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`px-2 py-1 rounded ${config.difficulty === 'Impossible' ? 'bg-red-500/20 text-red-400 font-bold animate-pulse' : 'bg-secondary'}`}>
                    {config.difficulty === 'Impossible' ? 'IMPOSSIBLE' : config.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded bg-secondary">{config.bpm} BPM</span>
                  {lightshowConfig.enabled && (
                    <span className="px-2 py-1 rounded bg-secondary flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {lightshowConfig.style}
                    </span>
                  )}
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
                  lightEvents={lightEvents}
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
                      <div className="font-medium text-foreground mb-1">Custom Media</div>
                      <p className="text-xs text-muted-foreground">Upload your own song and cover image</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">Lightshow</div>
                      <p className="text-xs text-muted-foreground">Multiple lighting styles synced to notes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="font-medium text-foreground mb-1">BeatSaver Ready</div>
                      <p className="text-xs text-muted-foreground">Valid v2.0.0 schema with all required files</p>
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
          <div className="flex items-center gap-4">
            {songFile && (
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3" />
                Song loaded
              </span>
            )}
            {coverFile && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-[#ff2d55] to-[#007aff]" />
                Cover loaded
              </span>
            )}
          </div>
        </div>
      </footer>
    </main>
  )
}
