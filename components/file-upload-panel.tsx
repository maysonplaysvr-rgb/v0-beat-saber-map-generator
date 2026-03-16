'use client'

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Music, Image, Check } from 'lucide-react'

interface FileUploadPanelProps {
  songFile: File | null
  coverFile: File | null
  coverPreview: string | null
  onSongChange: (file: File | null) => void
  onCoverChange: (file: File | null, preview: string | null) => void
  songDuration: number | null
}

export function FileUploadPanel({
  songFile,
  coverFile,
  coverPreview,
  onSongChange,
  onCoverChange,
  songDuration
}: FileUploadPanelProps) {
  const songInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [isDraggingSong, setIsDraggingSong] = useState(false)
  const [isDraggingCover, setIsDraggingCover] = useState(false)

  const handleSongSelect = useCallback((file: File | null) => {
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.ogg') || file.name.endsWith('.egg'))) {
      onSongChange(file)
    }
  }, [onSongChange])

  const handleCoverSelect = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onCoverChange(file, e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onCoverChange])

  const handleDrop = useCallback((
    e: React.DragEvent,
    type: 'song' | 'cover'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === 'song') {
      setIsDraggingSong(false)
    } else {
      setIsDraggingCover(false)
    }

    const file = e.dataTransfer.files[0]
    if (file) {
      if (type === 'song') {
        handleSongSelect(file)
      } else {
        handleCoverSelect(file)
      }
    }
  }, [handleSongSelect, handleCoverSelect])

  const handleDragOver = useCallback((e: React.DragEvent, type: 'song' | 'cover') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'song') {
      setIsDraggingSong(true)
    } else {
      setIsDraggingCover(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent, type: 'song' | 'cover') => {
    e.preventDefault()
    e.stopPropagation()
    if (type === 'song') {
      setIsDraggingSong(false)
    } else {
      setIsDraggingCover(false)
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-xl border border-border">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Media Files</h2>
        <p className="text-sm text-muted-foreground">Upload your song and cover image</p>
      </div>

      {/* Song Upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Song File</h3>
        
        <input
          ref={songInputRef}
          type="file"
          accept="audio/*,.ogg,.egg"
          className="hidden"
          onChange={(e) => handleSongSelect(e.target.files?.[0] || null)}
        />

        {songFile ? (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{songFile.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{(songFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {songDuration && (
                    <>
                      <span className="text-border">•</span>
                      <span>{formatDuration(songDuration)}</span>
                    </>
                  )}
                  <Check className="w-3 h-3 text-green-500 ml-1" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onSongChange(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`relative p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
              isDraggingSong 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }`}
            onClick={() => songInputRef.current?.click()}
            onDrop={(e) => handleDrop(e, 'song')}
            onDragOver={(e) => handleDragOver(e, 'song')}
            onDragLeave={(e) => handleDragLeave(e, 'song')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Drop your song here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports .ogg, .egg, .mp3, .wav
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          For BeatSaver, convert to .ogg format. The duration will be auto-detected.
        </p>
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Cover Image</h3>
        
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCoverSelect(e.target.files?.[0] || null)}
        />

        <div className="grid grid-cols-[120px_1fr] gap-4">
          {/* Preview */}
          <div
            className={`relative aspect-square rounded-lg overflow-hidden border-2 border-dashed transition-colors cursor-pointer ${
              isDraggingCover 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => coverInputRef.current?.click()}
            onDrop={(e) => handleDrop(e, 'cover')}
            onDragOver={(e) => handleDragOver(e, 'cover')}
            onDragLeave={(e) => handleDragLeave(e, 'cover')}
          >
            {coverPreview ? (
              <>
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30">
                <Image className="w-8 h-8 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">256x256</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-1">
            {coverFile ? (
              <div>
                <p className="text-sm font-medium text-foreground truncate">{coverFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(coverFile.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                  <Check className="w-3 h-3" />
                  <span>Image loaded</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground">No cover image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A gradient placeholder will be used
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? 'Change' : 'Upload'}
              </Button>
              {coverFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => onCoverChange(null, null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          BeatSaver requires 256x256 square images. Images will be included as-is.
        </p>
      </div>
    </div>
  )
}
