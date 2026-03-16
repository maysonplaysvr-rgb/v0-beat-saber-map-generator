'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Note, LightEvent } from '@/lib/beat-saber-generator'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface NoteVisualizerProps {
  notes: Note[]
  bpm: number
  isPlaying: boolean
  onPlayToggle: () => void
  lightEvents?: LightEvent[]
}

// Cut direction to rotation angle mapping
const DIRECTION_ROTATIONS: Record<number, number> = {
  0: 180,   // Up
  1: 0,     // Down
  2: 90,    // Left
  3: -90,   // Right
  4: 135,   // Up-Left
  5: -135,  // Up-Right
  6: 45,    // Down-Left
  7: -45,   // Down-Right
  8: 0      // Any (dot)
}

// Colors
const RED_COLOR = '#ff2d55'
const BLUE_COLOR = '#007aff'
const RED_GLOW = 'rgba(255, 45, 85, 0.6)'
const BLUE_GLOW = 'rgba(0, 122, 255, 0.6)'

export function NoteVisualizer({ 
  notes, 
  bpm, 
  isPlaying, 
  onPlayToggle,
  lightEvents = []
}: NoteVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  
  const [currentBeat, setCurrentBeat] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  // Calculate max beat from notes
  const maxBeat = notes.length > 0 ? Math.max(...notes.map(n => n._time)) + 8 : 100
  
  // Get active light state at current beat
  const getLightState = useCallback((beat: number) => {
    const activeEvents: Record<number, number> = {}
    
    for (const event of lightEvents) {
      if (event._time <= beat) {
        activeEvents[event._type] = event._value
      }
    }
    
    return activeEvents
  }, [lightEvents])
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ 
          width: Math.floor(rect.width), 
          height: Math.floor(rect.height) 
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Draw function
  const draw = useCallback((beat: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { width, height } = dimensions
    const lightState = getLightState(beat)
    
    // Clear canvas
    ctx.fillStyle = '#0a0a12'
    ctx.fillRect(0, 0, width, height)
    
    // Draw ambient lighting based on light events
    const ambientIntensity = Math.min(
      (lightState[0] || 0) + (lightState[4] || 0),
      7
    ) / 7 * 0.3
    
    if (ambientIntensity > 0) {
      const hasRed = [5, 6, 7].includes(lightState[0] || 0) || [5, 6, 7].includes(lightState[4] || 0)
      const gradient = ctx.createRadialGradient(
        width / 2, height * 0.3, 0,
        width / 2, height * 0.3, width
      )
      gradient.addColorStop(0, hasRed ? `rgba(255, 45, 85, ${ambientIntensity})` : `rgba(0, 122, 255, ${ambientIntensity})`)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    
    // Arc Viewer style settings
    const laneWidth = width * 0.5
    const laneHeight = height * 0.75
    const laneTop = height * 0.1
    const laneBottom = height * 0.85
    const horizonY = laneTop
    const playerY = laneBottom
    
    const laneLeft = (width - laneWidth) / 2
    const laneRight = laneLeft + laneWidth
    
    // Draw track/highway with perspective
    ctx.save()
    
    // Draw side rails
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 2
    
    // Left rail
    ctx.beginPath()
    ctx.moveTo(laneLeft, playerY)
    ctx.lineTo(width / 2 - 10, horizonY)
    ctx.stroke()
    
    // Right rail
    ctx.beginPath()
    ctx.moveTo(laneRight, playerY)
    ctx.lineTo(width / 2 + 10, horizonY)
    ctx.stroke()
    
    // Draw horizontal grid lines (beats) with perspective
    const visibleBeats = 16
    for (let i = 0; i <= visibleBeats; i++) {
      const beatOffset = i / visibleBeats
      const y = horizonY + (playerY - horizonY) * Math.pow(beatOffset, 0.7)
      const perspectiveScale = Math.pow(beatOffset, 0.5)
      const xLeft = width / 2 - (laneWidth / 2) * perspectiveScale
      const xRight = width / 2 + (laneWidth / 2) * perspectiveScale
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + beatOffset * 0.1})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(xLeft, y)
      ctx.lineTo(xRight, y)
      ctx.stroke()
    }
    
    // Draw vertical lane dividers with perspective
    for (let lane = 0; lane <= 4; lane++) {
      const laneRatio = lane / 4
      
      // Calculate points at bottom and top
      const bottomX = laneLeft + laneWidth * laneRatio
      const topX = (width / 2 - 10) + 20 * laneRatio
      
      ctx.strokeStyle = lane === 2 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = lane === 2 ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(bottomX, playerY)
      ctx.lineTo(topX, horizonY)
      ctx.stroke()
    }
    
    // Draw hit zone
    const hitZoneY = playerY - 30
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(laneLeft, hitZoneY, laneWidth, 30)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(laneLeft, hitZoneY, laneWidth, 30)
    
    ctx.restore()
    
    // Draw notes
    const noteSize = width * 0.06
    
    // Sort notes by time (furthest first for proper z-ordering)
    const sortedNotes = [...notes]
      .filter(note => {
        const timeDiff = note._time - beat
        return timeDiff > -1 && timeDiff < visibleBeats
      })
      .sort((a, b) => b._time - a._time)
    
    for (const note of sortedNotes) {
      const timeDiff = note._time - beat
      const progress = 1 - (timeDiff / visibleBeats) // 0 = far, 1 = close
      
      if (progress < 0 || progress > 1) continue
      
      // Calculate perspective position
      const perspectiveScale = Math.pow(progress, 0.7)
      const y = horizonY + (playerY - horizonY) * perspectiveScale - noteSize * perspectiveScale
      
      // Calculate X position based on lane with perspective
      const laneWidthAtY = laneWidth * Math.pow(progress, 0.5)
      const laneCenterX = width / 2
      const laneStartX = laneCenterX - laneWidthAtY / 2
      const cellWidth = laneWidthAtY / 4
      
      const x = laneStartX + (note._lineIndex + 0.5) * cellWidth
      
      // Calculate layer offset (y adjustment for height)
      const layerOffset = (2 - note._lineLayer) * noteSize * 0.4 * perspectiveScale
      const finalY = y + layerOffset
      
      // Scale based on perspective
      const scale = 0.3 + perspectiveScale * 0.7
      const scaledSize = noteSize * scale
      
      // Draw note
      const isRed = note._type === 0
      const color = isRed ? RED_COLOR : BLUE_COLOR
      const glow = isRed ? RED_GLOW : BLUE_GLOW
      
      ctx.save()
      ctx.translate(x, finalY)
      
      // Draw glow
      ctx.shadowColor = glow
      ctx.shadowBlur = 20 * scale
      
      // Draw cube face
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(-scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize, scaledSize * 0.15)
      ctx.fill()
      
      // Draw border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2 * scale
      ctx.stroke()
      
      // Reset shadow for arrow
      ctx.shadowBlur = 0
      
      // Draw direction arrow or dot
      if (note._cutDirection === 8) {
        // Dot note
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(0, 0, scaledSize * 0.2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Arrow
        ctx.rotate((DIRECTION_ROTATIONS[note._cutDirection] * Math.PI) / 180)
        
        const arrowSize = scaledSize * 0.3
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.moveTo(0, -arrowSize)
        ctx.lineTo(arrowSize * 0.6, arrowSize * 0.3)
        ctx.lineTo(0, 0)
        ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.3)
        ctx.closePath()
        ctx.fill()
      }
      
      ctx.restore()
    }
    
    // Draw laser effects based on light events
    const leftLaserValue = lightState[2] || 0
    const rightLaserValue = lightState[3] || 0
    
    if (leftLaserValue > 0) {
      const isRed = leftLaserValue >= 5
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = isRed ? RED_COLOR : BLUE_COLOR
      ctx.lineWidth = 3
      ctx.shadowColor = isRed ? RED_GLOW : BLUE_GLOW
      ctx.shadowBlur = 20
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(laneLeft - 50 - i * 20, height)
        ctx.lineTo(width / 2 - 100, 0)
        ctx.stroke()
      }
      ctx.restore()
    }
    
    if (rightLaserValue > 0) {
      const isRed = rightLaserValue >= 5
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = isRed ? RED_COLOR : BLUE_COLOR
      ctx.lineWidth = 3
      ctx.shadowColor = isRed ? RED_GLOW : BLUE_GLOW
      ctx.shadowBlur = 20
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(laneRight + 50 + i * 20, height)
        ctx.lineTo(width / 2 + 100, 0)
        ctx.stroke()
      }
      ctx.restore()
    }
    
    // Draw HUD
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Beat: ${beat.toFixed(1)}`, 20, 30)
    ctx.fillText(`BPM: ${bpm}`, 20, 50)
    ctx.fillText(`Notes: ${notes.length}`, 20, 70)
    
    // Draw saber indicators at bottom
    const saberWidth = 60
    const saberHeight = 8
    const saberY = height - 20
    
    // Left saber (red)
    ctx.fillStyle = RED_COLOR
    ctx.shadowColor = RED_GLOW
    ctx.shadowBlur = 10
    ctx.fillRect(laneLeft + laneWidth * 0.15 - saberWidth / 2, saberY, saberWidth, saberHeight)
    
    // Right saber (blue)
    ctx.fillStyle = BLUE_COLOR
    ctx.shadowColor = BLUE_GLOW
    ctx.fillRect(laneLeft + laneWidth * 0.85 - saberWidth / 2, saberY, saberWidth, saberHeight)
    
    ctx.shadowBlur = 0
    
  }, [dimensions, notes, bpm, getLightState])
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }
    
    startTimeRef.current = performance.now() - (pausedAtRef.current * (60000 / bpm))
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current
      const beat = (elapsed / 60000) * bpm
      
      if (beat > maxBeat) {
        pausedAtRef.current = 0
        setCurrentBeat(0)
        onPlayToggle()
        return
      }
      
      setCurrentBeat(beat)
      draw(beat)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, bpm, maxBeat, draw, onPlayToggle])
  
  // Update paused position when stopping
  useEffect(() => {
    if (!isPlaying) {
      pausedAtRef.current = currentBeat
    }
  }, [isPlaying, currentBeat])
  
  // Initial draw
  useEffect(() => {
    draw(currentBeat)
  }, [draw, currentBeat, dimensions])
  
  // Handle seek
  const handleSeek = (value: number[]) => {
    const newBeat = value[0]
    setCurrentBeat(newBeat)
    pausedAtRef.current = newBeat
    draw(newBeat)
  }
  
  // Skip forward/back
  const skipBack = () => {
    const newBeat = Math.max(0, currentBeat - 4)
    setCurrentBeat(newBeat)
    pausedAtRef.current = newBeat
    draw(newBeat)
  }
  
  const skipForward = () => {
    const newBeat = Math.min(maxBeat, currentBeat + 4)
    setCurrentBeat(newBeat)
    pausedAtRef.current = newBeat
    draw(newBeat)
  }
  
  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex-1 relative bg-[#0a0a12]">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-card border-t border-border flex flex-col gap-3">
        {/* Seek bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono w-12">
            {currentBeat.toFixed(1)}
          </span>
          <Slider
            value={[currentBeat]}
            onValueChange={handleSeek}
            min={0}
            max={maxBeat}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground font-mono w-12 text-right">
            {maxBeat.toFixed(1)}
          </span>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={onPlayToggle}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
