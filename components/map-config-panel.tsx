'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ENVIRONMENTS, type MapConfig, type EnvironmentName } from '@/lib/beat-saber-generator'

interface MapConfigPanelProps {
  config: MapConfig
  onConfigChange: (config: MapConfig) => void
  onGenerate: () => void
  onDownload: () => void
  isGenerating: boolean
  hasNotes: boolean
}

export function MapConfigPanel({
  config,
  onConfigChange,
  onGenerate,
  onDownload,
  isGenerating,
  hasNotes
}: MapConfigPanelProps) {
  const updateConfig = (updates: Partial<MapConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-xl border border-border">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Map Configuration</h2>
        <p className="text-sm text-muted-foreground">Configure your Beat Saber map settings</p>
      </div>
      
      {/* Song Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Song Info</h3>
        
        <div className="space-y-2">
          <Label htmlFor="songName" className="text-foreground">Song Title</Label>
          <Input
            id="songName"
            value={config.songName}
            onChange={(e) => updateConfig({ songName: e.target.value })}
            placeholder="Enter song title"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="songSubName" className="text-foreground">Subtitle (optional)</Label>
          <Input
            id="songSubName"
            value={config.songSubName}
            onChange={(e) => updateConfig({ songSubName: e.target.value })}
            placeholder="e.g., Remix, Feat. Artist"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="songAuthorName" className="text-foreground">Artist</Label>
          <Input
            id="songAuthorName"
            value={config.songAuthorName}
            onChange={(e) => updateConfig({ songAuthorName: e.target.value })}
            placeholder="Artist name"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="levelAuthorName" className="text-foreground">Map Author</Label>
          <Input
            id="levelAuthorName"
            value={config.levelAuthorName}
            onChange={(e) => updateConfig({ levelAuthorName: e.target.value })}
            placeholder="Your name"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      {/* Timing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Timing</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="bpm" className="text-foreground">BPM</Label>
            <span className="text-sm font-mono text-accent">{config.bpm}</span>
          </div>
          <Slider
            id="bpm"
            value={[config.bpm]}
            onValueChange={([value]) => updateConfig({ bpm: value })}
            min={60}
            max={300}
            step={1}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>60</span>
            <span>300</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="duration" className="text-foreground">Duration (seconds)</Label>
            <span className="text-sm font-mono text-accent">{config.duration}s</span>
          </div>
          <Slider
            id="duration"
            value={[config.duration]}
            onValueChange={([value]) => updateConfig({ duration: value })}
            min={30}
            max={300}
            step={5}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>30s</span>
            <span>5min</span>
          </div>
        </div>
      </div>
      
      {/* Difficulty */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Difficulty</h3>
        
        <Select
          value={config.difficulty}
          onValueChange={(value: MapConfig['difficulty']) => updateConfig({ difficulty: value })}
        >
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="Easy" className="text-popover-foreground">Easy</SelectItem>
            <SelectItem value="Normal" className="text-popover-foreground">Normal</SelectItem>
            <SelectItem value="Hard" className="text-popover-foreground">Hard</SelectItem>
            <SelectItem value="Expert" className="text-popover-foreground">Expert</SelectItem>
            <SelectItem value="ExpertPlus" className="text-popover-foreground">Expert+</SelectItem>
            <SelectItem value="Impossible" className="text-red-400 font-bold">Impossible</SelectItem>
          </SelectContent>
        </Select>
        
        <div className={`p-3 rounded-lg text-sm ${config.difficulty === 'Impossible' ? 'bg-red-950/50 border border-red-500/30' : 'bg-secondary/50'} text-muted-foreground`}>
          <p className={`font-medium mb-1 ${config.difficulty === 'Impossible' ? 'text-red-400' : 'text-foreground'}`}>Difficulty Info:</p>
          {config.difficulty === 'Easy' && <p>Slow, simple patterns with basic up/down cuts. Great for beginners.</p>}
          {config.difficulty === 'Normal' && <p>Moderate speed with basic flow patterns. No diagonal cuts.</p>}
          {config.difficulty === 'Hard' && <p>Faster notes with diagonal cuts and all 4 lanes.</p>}
          {config.difficulty === 'Expert' && <p>High density with jump streams and complex patterns.</p>}
          {config.difficulty === 'ExpertPlus' && <p>Maximum vanilla intensity. Fast streams and doubles.</p>}
          {config.difficulty === 'Impossible' && <p className="text-red-300">Beyond human limits. Note stacks, extreme speed, relentless streams. Good luck.</p>}
        </div>
      </div>
      
      {/* Environment */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Environment</h3>
        
        <Select
          value={config.environment}
          onValueChange={(value: EnvironmentName) => updateConfig({ environment: value })}
        >
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-[300px]">
            {ENVIRONMENTS.map((env) => (
              <SelectItem key={env.id} value={env.id} className="text-popover-foreground">
                <span className="flex flex-col">
                  <span>{env.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            {ENVIRONMENTS.find(e => e.id === config.environment)?.name || 'Environment'}
          </p>
          <p>{ENVIRONMENTS.find(e => e.id === config.environment)?.description}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Map
            </span>
          )}
        </Button>
        
        <Button
          onClick={onDownload}
          disabled={!hasNotes}
          variant="outline"
          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold"
          size="lg"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .zip
          </span>
        </Button>
      </div>
    </div>
  )
}
