'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Note } from '@/lib/beat-saber-generator'
import { CUT_DIRECTIONS } from '@/lib/beat-saber-generator'

interface NoteVisualizerProps {
  notes: Note[]
  bpm: number
  isPlaying: boolean
  onPlayToggle: () => void
}

const LANE_WIDTH = 60
const LANE_HEIGHT = 180
const NOTE_SIZE = 40
const GRID_COLS = 4
const GRID_ROWS = 3

// Direction arrows
const directionArrows: Record<number, string> = {
  [CUT_DIRECTIONS.UP]: '↑',
  [CUT_DIRECTIONS.DOWN]: '↓',
  [CUT_DIRECTIONS.LEFT]: '←',
  [CUT_DIRECTIONS.RIGHT]: '→',
  [CUT_DIRECTIONS.UP_LEFT]: '↖',
  [CUT_DIRECTIONS.UP_RIGHT]: '↗',
  [CUT_DIRECTIONS.DOWN_LEFT]: '↙',
  [CUT_DIRECTIONS.DOWN_RIGHT]: '↘',
  [CUT_DIRECTIONS.ANY]: '●'
}

export function NoteVisualizer({ notes, bpm, isPlaying, onPlayToggle }: NoteVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const [currentBeat, setCurrentBeat] = useState(0)
  
  const beatsPerSecond = bpm / 60
  const visibleBeats = 8 // How many beats to show ahead
  
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Calculate current beat
    if (isPlaying) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp
      }
      const elapsed = (timestamp - startTimeRef.current) / 1000
      const beat = elapsed * beatsPerSecond
      setCurrentBeat(beat)
    }
    
    // Clear canvas
    ctx.fillStyle = '#0a0a12'
    ctx.fillRect(0, 0, width, height)
    
    // Draw perspective grid
    const gridWidth = LANE_WIDTH * GRID_COLS
    const gridLeft = (width - gridWidth) / 2
    const gridTop = 40
    const trackLength = height - 100
    
    // Draw track background with perspective
    ctx.fillStyle = 'rgba(30, 30, 50, 0.5)'
    ctx.beginPath()
    ctx.moveTo(gridLeft - 20, height)
    ctx.lineTo(gridLeft + gridWidth + 20, height)
    ctx.lineTo(gridLeft + gridWidth / 2 + 40, gridTop)
    ctx.lineTo(gridLeft + gridWidth / 2 - 40, gridTop)
    ctx.closePath()
    ctx.fill()
    
    // Draw grid lines (perspective)
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)'
    ctx.lineWidth = 1
    
    // Horizontal lines (beat markers)
    for (let i = 0; i <= visibleBeats; i++) {
      const y = gridTop + (trackLength / visibleBeats) * i
      const perspectiveFactor = i / visibleBeats
      const leftX = gridLeft + (gridWidth / 2) * (1 - perspectiveFactor) - 20 * perspectiveFactor
      const rightX = gridLeft + gridWidth - (gridWidth / 2) * (1 - perspectiveFactor) + 20 * perspectiveFactor
      
      ctx.beginPath()
      ctx.moveTo(leftX, y)
      ctx.lineTo(rightX, y)
      ctx.stroke()
      
      // Beat number
      if (i < visibleBeats) {
        ctx.fillStyle = 'rgba(150, 150, 200, 0.5)'
        ctx.font = '10px monospace'
        ctx.fillText(`${Math.floor(currentBeat + visibleBeats - i)}`, leftX - 25, y + 4)
      }
    }
    
    // Vertical lane dividers
    for (let i = 0; i <= GRID_COLS; i++) {
      const bottomX = gridLeft + (LANE_WIDTH * i)
      const topX = gridLeft + gridWidth / 2 + ((i - GRID_COLS / 2) * LANE_WIDTH * 0.3)
      
      ctx.beginPath()
      ctx.moveTo(bottomX, height - 60)
      ctx.lineTo(topX, gridTop)
      ctx.stroke()
    }
    
    // Draw hit zone
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(gridLeft - 10, height - 70)
    ctx.lineTo(gridLeft + gridWidth + 10, height - 70)
    ctx.stroke()
    
    // Draw notes
    const notesInView = notes.filter(note => {
      const beatDiff = note._time - currentBeat
      return beatDiff >= -0.5 && beatDiff <= visibleBeats
    })
    
    notesInView.forEach(note => {
      const beatDiff = note._time - currentBeat
      const progress = 1 - (beatDiff / visibleBeats)
      
      // Calculate position with perspective
      const perspectiveFactor = progress
      const y = gridTop + trackLength * progress - 30
      
      // Lane position with perspective narrowing
      const laneCenter = gridLeft + (note._lineIndex + 0.5) * LANE_WIDTH
      const centerOffset = laneCenter - (gridLeft + gridWidth / 2)
      const perspectiveOffset = centerOffset * (0.3 + 0.7 * perspectiveFactor)
      const x = (gridLeft + gridWidth / 2) + perspectiveOffset
      
      // Size with perspective
      const size = NOTE_SIZE * (0.4 + 0.6 * perspectiveFactor)
      
      // Layer offset (vertical position within lane)
      const layerOffset = (2 - note._lineLayer) * (size * 0.3) * perspectiveFactor
      
      // Color based on type
      const isRed = note._type === 0
      const baseColor = isRed ? '#ff2d55' : '#007aff'
      const glowColor = isRed ? 'rgba(255, 45, 85, 0.6)' : 'rgba(0, 122, 255, 0.6)'
      
      // Draw glow
      ctx.shadowColor = baseColor
      ctx.shadowBlur = 15 * perspectiveFactor
      
      // Draw note block
      ctx.fillStyle = baseColor
      ctx.fillRect(x - size / 2, y - size / 2 + layerOffset, size, size)
      
      // Draw direction arrow
      ctx.shadowBlur = 0
      ctx.fillStyle = 'white'
      ctx.font = `bold ${size * 0.6}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(directionArrows[note._cutDirection] || '●', x, y + layerOffset)
    })
    
    // Reset shadow
    ctx.shadowBlur = 0
    
    // Draw lane labels
    const laneLabels = ['L2', 'L1', 'R1', 'R2']
    ctx.fillStyle = 'rgba(150, 150, 200, 0.6)'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    laneLabels.forEach((label, i) => {
      ctx.fillText(label, gridLeft + (i + 0.5) * LANE_WIDTH, height - 45)
    })
    
    // Draw layer labels
    ctx.textAlign = 'right'
    const layerLabels = ['Top', 'Mid', 'Bot']
    layerLabels.forEach((label, i) => {
      ctx.fillText(label, gridLeft - 30, height - 100 - i * 30)
    })
    
    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw)
    }
  }, [notes, bpm, beatsPerSecond, currentBeat, isPlaying])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set canvas size
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    
    // Initial draw
    draw(0)
    
    // Handle resize
    const handleResize = () => {
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
      draw(0)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])
  
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0
      animationRef.current = requestAnimationFrame(draw)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, draw])
  
  // Reset when notes change
  useEffect(() => {
    setCurrentBeat(0)
    startTimeRef.current = 0
    if (!isPlaying) {
      draw(0)
    }
  }, [notes, draw, isPlaying])
  
  return (
    <div className="relative h-full w-full min-h-[400px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg"
        style={{ background: 'linear-gradient(180deg, #0a0a15 0%, #15152a 100%)' }}
      />
      
      {/* Playback controls overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2">
        <button
          onClick={onPlayToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary/80 transition-colors text-primary-foreground"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="text-sm text-foreground font-mono">
          Beat: {currentBeat.toFixed(1)}
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-secondary/60 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff2d55' }} />
          <span className="text-foreground">Red (Left)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#007aff' }} />
          <span className="text-foreground">Blue (Right)</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="absolute top-4 left-4 bg-secondary/60 backdrop-blur-sm rounded-lg p-3 text-xs text-foreground">
        <div>Notes: {notes.length}</div>
        <div>BPM: {bpm}</div>
      </div>
    </div>
  )
}
