'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { LightshowConfig } from '@/lib/beat-saber-generator'

interface LightshowPanelProps {
  config: LightshowConfig
  onConfigChange: (config: LightshowConfig) => void
}

export function LightshowPanel({ config, onConfigChange }: LightshowPanelProps) {
  const updateConfig = (updates: Partial<LightshowConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-xl border border-border">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Lightshow</h2>
        <p className="text-sm text-muted-foreground">Configure lighting events for your map</p>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
        <div>
          <Label htmlFor="enableLightshow" className="text-foreground font-medium">Enable Lightshow</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Generate lighting events synced to notes</p>
        </div>
        <Switch
          id="enableLightshow"
          checked={config.enabled}
          onCheckedChange={(enabled) => updateConfig({ enabled })}
        />
      </div>

      {config.enabled && (
        <>
          {/* Intensity */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Intensity</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Light Density</Label>
                <span className="text-sm font-mono text-accent">{Math.round(config.intensity * 100)}%</span>
              </div>
              <Slider
                value={[config.intensity * 100]}
                onValueChange={([value]) => updateConfig({ intensity: value / 100 })}
                min={10}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Higher density creates more lighting events
              </p>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Style</h3>
            
            <div className="space-y-2">
              <Label className="text-foreground">Light Pattern</Label>
              <Select
                value={config.style}
                onValueChange={(value: LightshowConfig['style']) => updateConfig({ style: value })}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="reactive" className="text-popover-foreground">
                    <div className="flex flex-col">
                      <span>Reactive</span>
                      <span className="text-xs text-muted-foreground">Lights respond to each note</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="strobe" className="text-popover-foreground">
                    <div className="flex flex-col">
                      <span>Strobe</span>
                      <span className="text-xs text-muted-foreground">Fast on/off flashing effects</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="wave" className="text-popover-foreground">
                    <div className="flex flex-col">
                      <span>Wave</span>
                      <span className="text-xs text-muted-foreground">Smooth sweeping light waves</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pulse" className="text-popover-foreground">
                    <div className="flex flex-col">
                      <span>Pulse</span>
                      <span className="text-xs text-muted-foreground">Beat-synced pulsing lights</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rainbow" className="text-popover-foreground">
                    <div className="flex flex-col">
                      <span>Rainbow</span>
                      <span className="text-xs text-muted-foreground">Color cycling through spectrum</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Colors</h3>
            
            <div className="space-y-2">
              <Label className="text-foreground">Color Scheme</Label>
              <Select
                value={config.colorScheme}
                onValueChange={(value: LightshowConfig['colorScheme']) => updateConfig({ colorScheme: value })}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="match" className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#ff2d55]" />
                        <div className="w-3 h-3 rounded-full bg-[#007aff]" />
                      </div>
                      <span>Match Sabers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="contrast" className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <div className="w-3 h-3 rounded-full bg-orange-400" />
                      </div>
                      <span>High Contrast</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="warm" className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      </div>
                      <span>Warm</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cool" className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      </div>
                      <span>Cool</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mono" className="text-popover-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-white" />
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                      </div>
                      <span>Monochrome</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Effects</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <div>
                  <Label className="text-foreground">Ring Rotation</Label>
                  <p className="text-xs text-muted-foreground">Spin the ring lights</p>
                </div>
                <Switch
                  checked={config.ringRotation}
                  onCheckedChange={(ringRotation) => updateConfig({ ringRotation })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <div>
                  <Label className="text-foreground">Laser Speed</Label>
                  <p className="text-xs text-muted-foreground">Include laser movements</p>
                </div>
                <Switch
                  checked={config.laserSpeed}
                  onCheckedChange={(laserSpeed) => updateConfig({ laserSpeed })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <div>
                  <Label className="text-foreground">Boost Colors</Label>
                  <p className="text-xs text-muted-foreground">Use bright boost color events</p>
                </div>
                <Switch
                  checked={config.boostColors}
                  onCheckedChange={(boostColors) => updateConfig({ boostColors })}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#ff2d55]/20 via-purple-500/20 to-[#007aff]/20 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-[#007aff] animate-pulse delay-200" />
              <span className="text-sm font-medium text-foreground ml-2">Lightshow Preview</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {config.style === 'reactive' && 'Lights will flash in sync with each note hit.'}
              {config.style === 'strobe' && 'Fast strobing effects will create high energy moments.'}
              {config.style === 'wave' && 'Lights will flow smoothly across the environment.'}
              {config.style === 'pulse' && 'Lights will pulse in time with the beat.'}
              {config.style === 'rainbow' && 'Colors will cycle through the spectrum continuously.'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
