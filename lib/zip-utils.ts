// Beat Saber Map Generator - V3 Extended
// Generates valid BeatSaver-compatible map files with V3 features

export interface Note {
  _time: number
  _lineIndex: number // 0-3 (left to right)
  _lineLayer: number // 0-2 (bottom to top)
  _type: number // 0=Red, 1=Blue
  _cutDirection: number // 0-8 (see CUT_DIRECTIONS)
}

// ─────────────────────────────────────────────
// V3: Arc (Slider) – connects two notes of the same color
// ─────────────────────────────────────────────
export interface Arc {
  _colorType: number          // 0=Red, 1=Blue  (matches Note._type)
  _headTime: number           // beat of the head note
  _headLineIndex: number      // column of head note (0-3)
  _headLineLayer: number      // row of head note (0-2)
  _headCutDirection: number   // cut direction of head note
  _headControlPointLengthMultiplier: number // Bézier curve pull (0.5–1.0)
  _tailTime: number           // beat of the tail note
  _tailLineIndex: number
  _tailLineLayer: number
  _tailCutDirection: number
  _tailControlPointLengthMultiplier: number
  _sliderMidAnchorMode: number // 0=straight, 1=clockwise, 2=counter-clockwise
}

// ─────────────────────────────────────────────
// V3: Chain (burstSlider) – a head note that explodes into segment dots
// ─────────────────────────────────────────────
export interface Chain {
  _colorType: number
  _headTime: number
  _headLineIndex: number
  _headLineLayer: number
  _headCutDirection: number
  _tailTime: number
  _tailLineIndex: number
  _tailLineLayer: number
  _sliceCount: number   // number of chain segments (2–8)
  _squishFactor: number // 0.5–1.0; how compressed the segments are
}

// ─────────────────────────────────────────────
// V3: Basic lighting event
// ─────────────────────────────────────────────
export interface BasicBeatmapEvent {
  _time: number
  _type: number  // light group (see LIGHT_TYPES)
  _value: number // color + behavior (see LIGHT_VALUES)
  _floatValue: number // brightness multiplier (0.0–1.0; use 1.0 by default)
}

// Beat Saber Environment Names
export const ENVIRONMENTS = [
  { id: 'DefaultEnvironment', name: 'Default', description: 'Classic Beat Saber environment' },
  { id: 'OriginsEnvironment', name: 'Origins', description: 'Clean minimalist design' },
  { id: 'TriangleEnvironment', name: 'Triangle', description: 'Geometric triangular shapes' },
  { id: 'NiceEnvironment', name: 'Nice', description: 'Smooth and pleasant visuals' },
  { id: 'BigMirrorEnvironment', name: 'Big Mirror', description: 'Large reflective surfaces' },
  { id: 'DragonsEnvironment', name: 'Dragons', description: 'Imagine Dragons collaboration' },
  { id: 'KDAEnvironment', name: 'K/DA', description: 'League of Legends K/DA theme' },
  { id: 'MonstercatEnvironment', name: 'Monstercat', description: 'Monstercat music pack theme' },
  { id: 'CrabRaveEnvironment', name: 'Crab Rave', description: 'Noisestorm Crab Rave theme' },
  { id: 'PanicEnvironment', name: 'Panic', description: 'Panic! At The Disco theme' },
  { id: 'RocketEnvironment', name: 'Rocket', description: 'Rocket League collaboration' },
  { id: 'GreenDayEnvironment', name: 'Green Day', description: 'Green Day music pack theme' },
  { id: 'GreenDayGrenadeEnvironment', name: 'Green Day Grenade', description: 'Green Day grenade variant' },
  { id: 'TimbalandEnvironment', name: 'Timbaland', description: 'Timbaland music pack theme' },
  { id: 'FitBeatEnvironment', name: 'FitBeat', description: 'Fitness-focused environment' },
  { id: 'LinkinParkEnvironment', name: 'Linkin Park', description: 'Linkin Park music pack theme' },
  { id: 'BTSEnvironment', name: 'BTS', description: 'BTS music pack theme' },
  { id: 'KaleidoscopeEnvironment', name: 'Kaleidoscope', description: 'Colorful kaleidoscope patterns' },
  { id: 'InterscopeEnvironment', name: 'Interscope', description: 'Interscope Records theme' },
  { id: 'SkrillexEnvironment', name: 'Skrillex', description: 'Skrillex music pack theme' },
  { id: 'BillieEnvironment', name: 'Billie', description: 'Billie Eilish music pack theme' },
  { id: 'HalloweenEnvironment', name: 'Halloween', description: 'Spooky Halloween theme' },
  { id: 'GagaEnvironment', name: 'Lady Gaga', description: 'Lady Gaga music pack theme' },
] as const

export type EnvironmentName = typeof ENVIRONMENTS[number]['id']

export interface MapConfig {
  bpm: number
  songName: string
  songSubName: string
  songAuthorName: string
  levelAuthorName: string
  duration: number // in seconds
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'ExpertPlus' | 'Impossible'
  environment: EnvironmentName
}

export interface LightshowConfig {
  enabled: boolean
  intensity: number // 0-1
  style: 'reactive' | 'strobe' | 'wave' | 'pulse' | 'rainbow'
  colorScheme: 'match' | 'contrast' | 'warm' | 'cool' | 'mono'
  ringRotation: boolean
  laserSpeed: boolean
  boostColors: boolean
}

export interface LightEvent {
  _time: number
  _type: number // 0-4 for different light groups
  _value: number // 0=off, 1-3=blue, 5-7=red
}

export const defaultLightshowConfig: LightshowConfig = {
  enabled: true,
  intensity: 0.7,
  style: 'reactive',
  colorScheme: 'match',
  ringRotation: true,
  laserSpeed: true,
  boostColors: false
}

// Cut directions: 0=Up, 1=Down, 2=Left, 3=Right, 4=UpLeft, 5=UpRight, 6=DownLeft, 7=DownRight, 8=Any
export const CUT_DIRECTIONS = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
  UP_LEFT: 4,
  UP_RIGHT: 5,
  DOWN_LEFT: 6,
  DOWN_RIGHT: 7,
  ANY: 8
}

// Flow-friendly direction pairs (alternating swings)
const FLOW_PAIRS: Record<number, number[]> = {
  [CUT_DIRECTIONS.UP]: [CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.DOWN_LEFT, CUT_DIRECTIONS.DOWN_RIGHT],
  [CUT_DIRECTIONS.DOWN]: [CUT_DIRECTIONS.UP, CUT_DIRECTIONS.UP_LEFT, CUT_DIRECTIONS.UP_RIGHT],
  [CUT_DIRECTIONS.LEFT]: [CUT_DIRECTIONS.RIGHT, CUT_DIRECTIONS.UP_RIGHT, CUT_DIRECTIONS.DOWN_RIGHT],
  [CUT_DIRECTIONS.RIGHT]: [CUT_DIRECTIONS.LEFT, CUT_DIRECTIONS.UP_LEFT, CUT_DIRECTIONS.DOWN_LEFT],
  [CUT_DIRECTIONS.UP_LEFT]: [CUT_DIRECTIONS.DOWN_RIGHT, CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.RIGHT],
  [CUT_DIRECTIONS.UP_RIGHT]: [CUT_DIRECTIONS.DOWN_LEFT, CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.LEFT],
  [CUT_DIRECTIONS.DOWN_LEFT]: [CUT_DIRECTIONS.UP_RIGHT, CUT_DIRECTIONS.UP, CUT_DIRECTIONS.RIGHT],
  [CUT_DIRECTIONS.DOWN_RIGHT]: [CUT_DIRECTIONS.UP_LEFT, CUT_DIRECTIONS.UP, CUT_DIRECTIONS.LEFT],
  [CUT_DIRECTIONS.ANY]: [CUT_DIRECTIONS.ANY]
}

// Calculate minimum time offset for first note (1.5 seconds in beats)
export function getMinStartBeat(bpm: number): number {
  return (1.5 / 60) * bpm
}

// Generate procedural notes with flow logic
export function generateNotes(config: MapConfig): Note[] {
  const notes: Note[] = []
  const { bpm, duration, difficulty } = config

  // Calculate beats
  const totalBeats = (duration / 60) * bpm
  const minStartBeat = getMinStartBeat(bpm)

  const difficultySettings: Record<string, {
    notesPerBeat: number
    complexity: number
    useAllLanes: boolean
    useDiagonals: boolean
    jumpStreams: boolean
    maxConsecutiveSameHand: number
  }> = {
    Easy:       { notesPerBeat: 0.25, complexity: 0.1,  useAllLanes: false, useDiagonals: false, jumpStreams: false, maxConsecutiveSameHand: 2  },
    Normal:     { notesPerBeat: 0.5,  complexity: 0.2,  useAllLanes: false, useDiagonals: false, jumpStreams: false, maxConsecutiveSameHand: 3  },
    Hard:       { notesPerBeat: 1,    complexity: 0.4,  useAllLanes: true,  useDiagonals: true,  jumpStreams: false, maxConsecutiveSameHand: 4  },
    Expert:     { notesPerBeat: 2,    complexity: 0.6,  useAllLanes: true,  useDiagonals: true,  jumpStreams: true,  maxConsecutiveSameHand: 5  },
    ExpertPlus: { notesPerBeat: 3,    complexity: 0.75, useAllLanes: true,  useDiagonals: true,  jumpStreams: true,  maxConsecutiveSameHand: 6  },
    Impossible: { notesPerBeat: 5,    complexity: 0.95, useAllLanes: true,  useDiagonals: true,  jumpStreams: true,  maxConsecutiveSameHand: 10 }
  }

  const settings = difficultySettings[difficulty] || difficultySettings.ExpertPlus

  let lastRedDirection = CUT_DIRECTIONS.DOWN
  let lastBlueDirection = CUT_DIRECTIONS.DOWN
  let consecutiveRedNotes = 0
  let consecutiveBlueNotes = 0

  let currentBeat = minStartBeat
  const beatInterval = 1 / settings.notesPerBeat

  while (currentBeat < totalBeats - 2) {
    const placeDouble = Math.random() < settings.complexity
    const placeStack  = difficulty === 'Impossible' && Math.random() < 0.3

    if (placeStack) {
      const stackCount = Math.floor(Math.random() * 3) + 2
      for (let i = 0; i < stackCount; i++) {
        const isRed = i % 2 === 0
        const type  = isRed ? 0 : 1
        const lastDirection = isRed ? lastRedDirection : lastBlueDirection
        const side  = isRed ? 'left' : 'right'
        const note  = generateSingleNote(currentBeat, type, lastDirection, side, settings)
        note._lineLayer = i % 3
        notes.push(note)
        if (isRed) lastRedDirection  = note._cutDirection
        else       lastBlueDirection = note._cutDirection
      }
    } else if (placeDouble) {
      const redNote  = generateSingleNote(currentBeat, 0, lastRedDirection,  'left',  settings)
      const blueNote = generateSingleNote(currentBeat, 1, lastBlueDirection, 'right', settings)
      notes.push(redNote, blueNote)
      lastRedDirection  = redNote._cutDirection
      lastBlueDirection = blueNote._cutDirection
      consecutiveRedNotes  = 1
      consecutiveBlueNotes = 1
    } else {
      let isRed: boolean
      if      (consecutiveRedNotes  >= settings.maxConsecutiveSameHand) isRed = false
      else if (consecutiveBlueNotes >= settings.maxConsecutiveSameHand) isRed = true
      else                                                               isRed = Math.random() < 0.5

      const type  = isRed ? 0 : 1
      const lastDirection = isRed ? lastRedDirection : lastBlueDirection
      const side  = isRed ? 'left' : 'right'
      const note  = generateSingleNote(currentBeat, type, lastDirection, side, settings)
      notes.push(note)

      if (isRed) { lastRedDirection  = note._cutDirection; consecutiveRedNotes++;  consecutiveBlueNotes = 0 }
      else       { lastBlueDirection = note._cutDirection; consecutiveBlueNotes++; consecutiveRedNotes  = 0 }
    }

    if (settings.jumpStreams && Math.random() < 0.2) {
      const burstCount = Math.floor(Math.random() * 4) + 2
      for (let i = 0; i < burstCount; i++) {
        currentBeat += 0.125
        if (currentBeat >= totalBeats - 2) break
        const isRed = i % 2 === 0
        const type  = isRed ? 0 : 1
        const lastDirection = isRed ? lastRedDirection : lastBlueDirection
        const side  = isRed ? 'left' : 'right'
        const note  = generateSingleNote(currentBeat, type, lastDirection, side, settings)
        notes.push(note)
        if (isRed) lastRedDirection  = note._cutDirection
        else       lastBlueDirection = note._cutDirection
      }
    }

    const variation = difficulty === 'Easy' ? 0 : (Math.random() - 0.5) * 0.05
    currentBeat += beatInterval + variation
  }

  return notes
}

interface DifficultySettingsType {
  notesPerBeat: number
  complexity: number
  useAllLanes: boolean
  useDiagonals: boolean
  jumpStreams: boolean
  maxConsecutiveSameHand: number
}

function generateSingleNote(
  time: number,
  type: number,
  lastDirection: number,
  preferredSide: 'left' | 'right',
  settings: DifficultySettingsType
): Note {
  let possibleDirections = FLOW_PAIRS[lastDirection] || [CUT_DIRECTIONS.DOWN]
  if (!settings.useDiagonals) {
    possibleDirections = possibleDirections.filter(d =>
      d === CUT_DIRECTIONS.UP || d === CUT_DIRECTIONS.DOWN ||
      d === CUT_DIRECTIONS.LEFT || d === CUT_DIRECTIONS.RIGHT ||
      d === CUT_DIRECTIONS.ANY
    )
    if (possibleDirections.length === 0) possibleDirections = [CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.UP]
  }

  const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]

  let lineIndex: number
  if (settings.useAllLanes) {
    lineIndex = preferredSide === 'left'
      ? (Math.random() < 0.6 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2) + 2)
      : (Math.random() < 0.6 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2))
  } else {
    lineIndex = preferredSide === 'left' ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2) + 2
  }

  let lineLayer: number
  if ([CUT_DIRECTIONS.UP, CUT_DIRECTIONS.UP_LEFT, CUT_DIRECTIONS.UP_RIGHT].includes(newDirection)) {
    lineLayer = Math.random() < 0.6 ? 0 : 1
  } else if ([CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.DOWN_LEFT, CUT_DIRECTIONS.DOWN_RIGHT].includes(newDirection)) {
    lineLayer = Math.random() < 0.6 ? 2 : 1
  } else {
    lineLayer = Math.floor(Math.random() * 3)
  }

  return {
    _time: Math.round(time * 1000) / 1000,
    _lineIndex: lineIndex,
    _lineLayer: lineLayer,
    _type: type,
    _cutDirection: newDirection
  }
}

// ═══════════════════════════════════════════════════════════════════════
// V3 FEATURE 1: ARCS (Sliders)
// Scans sorted notes and connects consecutive same-color notes that are
// close enough in time to form a flowing arc gesture.
// ═══════════════════════════════════════════════════════════════════════

/**
 * Maximum beat gap between two notes for them to be arc-connected.
 * Tighter gaps feel like legato strokes; wider gaps break the flow.
 */
const ARC_MAX_GAP_BEATS = 0.75

/**
 * generateArcs – creates an Arc for every eligible pair of same-color notes
 * where the time gap is within ARC_MAX_GAP_BEATS.
 *
 * Both notes in a pair are consumed by the arc, so we track used indices
 * to avoid double-connecting the same note as both head and tail.
 */
export function generateArcs(notes: Note[]): Arc[] {
  const arcs: Arc[] = []
  // Sort ascending by time (generateNotes should already do this, but be safe)
  const sorted = [...notes].sort((a, b) => a._time - b._time)

  // Track which note indices have already been used as an arc tail
  const usedAsTail = new Set<number>()

  for (let i = 0; i < sorted.length - 1; i++) {
    if (usedAsTail.has(i)) continue

    const head = sorted[i]

    // Find the next note of the same color that hasn't been used as a tail yet
    for (let j = i + 1; j < sorted.length; j++) {
      if (usedAsTail.has(j)) continue
      const tail = sorted[j]

      // Must be the same color (hand)
      if (tail._type !== head._type) continue

      const gap = tail._time - head._time
      if (gap > ARC_MAX_GAP_BEATS) break // Notes are too far apart; no point looking further

      // Build the arc
      const arc: Arc = {
        _colorType: head._type,
        _headTime: head._time,
        _headLineIndex: head._lineIndex,
        _headLineLayer: head._lineLayer,
        _headCutDirection: head._cutDirection,
        // Longer gaps get a stronger Bézier pull for a more dramatic curve
        _headControlPointLengthMultiplier: roundTo3(0.5 + gap * 0.4),
        _tailTime: tail._time,
        _tailLineIndex: tail._lineIndex,
        _tailLineLayer: tail._lineLayer,
        _tailCutDirection: tail._cutDirection,
        _tailControlPointLengthMultiplier: roundTo3(0.5 + gap * 0.4),
        // Alternate anchor modes for visual variety
        _sliderMidAnchorMode: (arcs.length % 3 === 0) ? 0 : (arcs.length % 3 === 1) ? 1 : 2
      }

      arcs.push(arc)
      usedAsTail.add(j)
      break // Each head connects to exactly one tail
    }
  }

  return arcs
}

// ═══════════════════════════════════════════════════════════════════════
// V3 FEATURE 2: CHAINS (burstSliders)
// In 'Impossible' mode, randomly replaces single notes with chain heads.
// The chain tail is placed one lane to the right (for red) or left (for
// blue) so segments fan outward from the swing direction.
// ═══════════════════════════════════════════════════════════════════════

/**
 * Probability that any given note becomes a chain in Impossible mode.
 * Set lower to keep chains special, not overwhelming.
 */
const CHAIN_REPLACE_PROBABILITY = 0.15

/**
 * generateChains – iterates over notes in Impossible mode and replaces
 * eligible notes with Chain objects. Returns both the mutated note list
 * (chains removed) and the array of Chain objects.
 */
export function generateChains(
  notes: Note[],
  difficulty: MapConfig['difficulty']
): { notes: Note[]; chains: Chain[] } {
  if (difficulty !== 'Impossible') {
    return { notes, chains: [] }
  }

  const remainingNotes: Note[] = []
  const chains: Chain[] = []

  for (const note of notes) {
    if (Math.random() >= CHAIN_REPLACE_PROBABILITY) {
      remainingNotes.push(note)
      continue
    }

    // Determine chain tail position: fan outward from the note's side
    const tailOffset = note._type === 0 ? 1 : -1 // Red fans right, Blue fans left
    const tailLineIndex = Math.max(0, Math.min(3, note._lineIndex + tailOffset))

    // Tail appears slightly after the head (1/8 beat) to give the burst direction
    const chain: Chain = {
      _colorType: note._type,
      _headTime: note._time,
      _headLineIndex: note._lineIndex,
      _headLineLayer: note._lineLayer,
      _headCutDirection: note._cutDirection,
      _tailTime: roundTo3(note._time + 0.125),
      _tailLineIndex: tailLineIndex,
      _tailLineLayer: note._lineLayer, // keep same row; horizontal fan looks cleaner
      _sliceCount: Math.floor(Math.random() * 4) + 3, // 3–6 segments
      _squishFactor: roundTo3(0.6 + Math.random() * 0.35) // 0.6–0.95
    }

    chains.push(chain)
    // The head note is consumed by the chain; do NOT keep it in notes
  }

  return { notes: remainingNotes, chains }
}

// ═══════════════════════════════════════════════════════════════════════
// V3 FEATURE 3: LIGHTING – generateLighting
// Produces basicBeatmapEvents that pulse back/top lasers every beat and
// side lasers every 4 beats, referenced from the song BPM.
// ═══════════════════════════════════════════════════════════════════════

// Light event types (V2-compatible names still used in V3 basicBeatmapEvents)
const LIGHT_TYPES = {
  BACK_LASERS:       0,
  RING_LIGHTS:       1,
  LEFT_LASERS:       2,
  RIGHT_LASERS:      3,
  CENTER_LIGHTS:     4,
  BOOST_COLORS:      5,
  RING_ROTATION:     8,
  RING_ZOOM:         9,
  LEFT_LASER_SPEED:  12,
  RIGHT_LASER_SPEED: 13
}

// Light values
const LIGHT_VALUES = {
  OFF:        0,
  BLUE_ON:    1,
  BLUE_FLASH: 2,
  BLUE_FADE:  3,
  RED_ON:     5,
  RED_FLASH:  6,
  RED_FADE:   7
}

/**
 * generateLighting – the new V3-aware lighting generator.
 *
 * Strategy:
 *  • Every beat  → flash BACK_LASERS and CENTER_LIGHTS (alternating red/blue)
 *  • Every 4 beats → flash LEFT_LASERS + RIGHT_LASERS together (side burst)
 *  • Fade-off events follow each flash 0.25 beats later to avoid wash-out
 *  • A RING_ROTATION event is added every 8 beats for environmental motion
 *  • All events include _floatValue for V3 brightness support
 */
export function generateLighting(bpm: number, duration: number): BasicBeatmapEvent[] {
  const events: BasicBeatmapEvent[] = []
  const totalBeats = Math.ceil((duration / 60) * bpm)

  for (let beat = 0; beat < totalBeats; beat++) {
    // ── Per-beat: back lasers + center lights ──────────────────────────
    const isEvenBeat = beat % 2 === 0
    const backValue  = isEvenBeat ? LIGHT_VALUES.BLUE_FLASH : LIGHT_VALUES.RED_FLASH

    events.push(evt(beat, LIGHT_TYPES.BACK_LASERS,   backValue, 1.0))
    events.push(evt(beat, LIGHT_TYPES.CENTER_LIGHTS, backValue, 0.8))
    // Fade off after quarter-beat to keep it punchy
    events.push(evt(beat + 0.25, LIGHT_TYPES.BACK_LASERS,   LIGHT_VALUES.OFF, 0))
    events.push(evt(beat + 0.25, LIGHT_TYPES.CENTER_LIGHTS, LIGHT_VALUES.OFF, 0))

    // ── Every 4 beats: side lasers burst ──────────────────────────────
    if (beat % 4 === 0) {
      // Left and right lasers fire opposite colors for contrast
      events.push(evt(beat, LIGHT_TYPES.LEFT_LASERS,  LIGHT_VALUES.RED_FLASH,  1.0))
      events.push(evt(beat, LIGHT_TYPES.RIGHT_LASERS, LIGHT_VALUES.BLUE_FLASH, 1.0))
      // Fade off after half-beat; side bursts linger slightly longer
      events.push(evt(beat + 0.5, LIGHT_TYPES.LEFT_LASERS,  LIGHT_VALUES.OFF, 0))
      events.push(evt(beat + 0.5, LIGHT_TYPES.RIGHT_LASERS, LIGHT_VALUES.OFF, 0))
    }

    // ── Every 8 beats: ring rotation ──────────────────────────────────
    if (beat % 8 === 0) {
      // Alternate rotation direction
      events.push(evt(beat, LIGHT_TYPES.RING_ROTATION, (beat / 8) % 2 === 0 ? 1 : 0, 1.0))
    }
  }

  // Sort by time for spec compliance
  return events.sort((a, b) => a._time - b._time)
}

/** Helper: construct a BasicBeatmapEvent with rounded time. */
function evt(time: number, type: number, value: number, floatValue: number): BasicBeatmapEvent {
  return {
    _time: roundTo3(time),
    _type: type,
    _value: value,
    _floatValue: floatValue
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Updated generateDifficultyDat – outputs a V3-compatible difficulty file
// ═══════════════════════════════════════════════════════════════════════

/**
 * generateDifficultyDat – builds the full difficulty .dat object.
 *
 * New V3 fields added:
 *  • sliders          ← arcs
 *  • burstSliders     ← chains
 *  • basicBeatmapEvents ← lighting (replaces legacy _events in V3)
 *
 * Legacy _events is still populated for V2 fallback compatibility.
 */
export function generateDifficultyDat(
  notes: Note[],
  lightshowConfig: LightshowConfig,
  bpm: number,
  duration: number,
  difficulty: MapConfig['difficulty']
): object {
  // Step 1: extract chains from notes (Impossible mode only)
  const { notes: notesAfterChains, chains } = generateChains(notes, difficulty)

  // Step 2: build arcs from the remaining notes
  const arcs = generateArcs(notesAfterChains)

  // Step 3: build lighting
  const basicBeatmapEvents = lightshowConfig.enabled
    ? generateLighting(bpm, duration)
    : []

  // Step 4: legacy events for V2 clients
  const legacyEvents = lightshowConfig.enabled
    ? generateLightEvents(notesAfterChains, lightshowConfig, bpm)
    : []

  return {
    _version: "3.0.0",       // Bumped to V3
    _notes: notesAfterChains,
    _sliders: arcs,           // V3: arcs
    _burstSliders: chains,    // V3: chains
    _obstacles: [],
    _events: legacyEvents,    // V2 compatibility fallback
    basicBeatmapEvents,       // V3: structured lighting
    _customData: {}
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Unchanged exports below – kept intact for API compatibility
// ═══════════════════════════════════════════════════════════════════════

export function generateInfoDat(config: MapConfig): object {
  return {
    _version: "2.0.0",
    _songName: config.songName,
    _songSubName: config.songSubName,
    _songAuthorName: config.songAuthorName,
    _levelAuthorName: config.levelAuthorName,
    _beatsPerMinute: config.bpm,
    _shuffle: 0,
    _shufflePeriod: 0.5,
    _previewStartTime: 30,
    _previewDuration: 15,
    _songFilename: "song.ogg",
    _coverImageFilename: "cover.png",
    _environmentName: config.environment || "DefaultEnvironment",
    _songTimeOffset: 0,
    _customData: {
      _editors: {
        _lastEditedBy: "BeatSaber Map Generator",
        "BeatSaber Map Generator": { version: "2.0.0" }
      }
    },
    _difficultyBeatmapSets: [
      {
        _beatmapCharacteristicName: "Standard",
        _difficultyBeatmaps: [
          {
            _difficulty: config.difficulty,
            _difficultyRank: getDifficultyRank(config.difficulty),
            _beatmapFilename: `${config.difficulty}Standard.dat`,
            _noteJumpMovementSpeed: getJumpSpeed(config.difficulty),
            _noteJumpStartBeatOffset: 0,
            _customData: {}
          }
        ]
      }
    ]
  }
}

function getDifficultyRank(difficulty: string): number {
  const ranks: Record<string, number> = {
    Easy: 1, Normal: 3, Hard: 5, Expert: 7, ExpertPlus: 9, Impossible: 9
  }
  return ranks[difficulty] || 9
}

function getJumpSpeed(difficulty: string): number {
  const speeds: Record<string, number> = {
    Easy: 10, Normal: 12, Hard: 14, Expert: 16, ExpertPlus: 18, Impossible: 23
  }
  return speeds[difficulty] || 16
}

// Legacy light generators (kept for V2 fallback in generateDifficultyDat)

export function generateLightEvents(
  notes: Note[],
  config: LightshowConfig,
  _bpm: number
): LightEvent[] {
  const events: LightEvent[] = []
  const totalBeats = notes.length > 0 ? notes[notes.length - 1]._time + 4 : 0

  switch (config.style) {
    case 'reactive': events.push(...generateReactiveEvents(notes, config)); break
    case 'strobe':   events.push(...generateStrobeEvents(notes, config, totalBeats)); break
    case 'wave':     events.push(...generateWaveEvents(notes, config, totalBeats)); break
    case 'pulse':    events.push(...generatePulseEvents(notes, config, totalBeats)); break
    case 'rainbow':  events.push(...generateRainbowEvents(notes, config, totalBeats)); break
  }
  if (config.ringRotation) events.push(...generateRingRotationEvents(totalBeats, config.intensity))
  if (config.laserSpeed)   events.push(...generateLaserSpeedEvents(totalBeats, config.intensity))
  if (config.boostColors)  events.push(...generateBoostColorEvents(notes, config.intensity))

  return events.sort((a, b) => a._time - b._time)
}

function getColorValue(config: LightshowConfig, noteType: number, flash: boolean = false): number {
  const isRed = noteType === 0
  switch (config.colorScheme) {
    case 'match':    return isRed ? (flash ? LIGHT_VALUES.RED_FLASH  : LIGHT_VALUES.RED_ON)  : (flash ? LIGHT_VALUES.BLUE_FLASH : LIGHT_VALUES.BLUE_ON)
    case 'contrast': return isRed ? (flash ? LIGHT_VALUES.BLUE_FLASH : LIGHT_VALUES.BLUE_ON) : (flash ? LIGHT_VALUES.RED_FLASH  : LIGHT_VALUES.RED_ON)
    case 'warm':     return flash ? LIGHT_VALUES.RED_FLASH  : LIGHT_VALUES.RED_ON
    case 'cool':     return flash ? LIGHT_VALUES.BLUE_FLASH : LIGHT_VALUES.BLUE_ON
    case 'mono':     return flash ? LIGHT_VALUES.BLUE_FLASH : LIGHT_VALUES.BLUE_FADE
    default:         return LIGHT_VALUES.BLUE_ON
  }
}

function generateReactiveEvents(notes: Note[], config: LightshowConfig): LightEvent[] {
  const events: LightEvent[] = []
  const skipRate = Math.max(1, Math.round((1 - config.intensity) * 4))
  notes.forEach((note, index) => {
    if (index % skipRate !== 0) return
    const lightType = note._lineIndex < 2 ? LIGHT_TYPES.LEFT_LASERS : LIGHT_TYPES.RIGHT_LASERS
    events.push({ _time: note._time, _type: lightType, _value: getColorValue(config, note._type, true) })
    if (index % 2 === 0) events.push({ _time: note._time, _type: LIGHT_TYPES.CENTER_LIGHTS, _value: getColorValue(config, note._type, false) })
    if (index % 4 === 0) events.push({ _time: note._time, _type: LIGHT_TYPES.BACK_LASERS,   _value: getColorValue(config, note._type, false) })
    events.push({ _time: note._time + 0.25, _type: lightType, _value: LIGHT_VALUES.OFF })
  })
  return events
}

function generateStrobeEvents(notes: Note[], config: LightshowConfig, totalBeats: number): LightEvent[] {
  const events: LightEvent[] = []
  const strobeInterval = 0.125 / config.intensity
  let currentBeat = 0
  let toggleRed = true
  while (currentBeat < totalBeats) {
    const nearbyNote = notes.find(n => Math.abs(n._time - currentBeat) < 0.5)
    if (nearbyNote) {
      events.push({ _time: currentBeat, _type: LIGHT_TYPES.BACK_LASERS,   _value: toggleRed ? LIGHT_VALUES.RED_FLASH : LIGHT_VALUES.BLUE_FLASH })
      events.push({ _time: currentBeat, _type: LIGHT_TYPES.CENTER_LIGHTS, _value: toggleRed ? LIGHT_VALUES.RED_FLASH : LIGHT_VALUES.BLUE_FLASH })
      toggleRed = !toggleRed
      currentBeat += strobeInterval
    } else {
      currentBeat += 0.5
    }
  }
  return events
}

function generateWaveEvents(notes: Note[], config: LightshowConfig, totalBeats: number): LightEvent[] {
  const events: LightEvent[] = []
  const waveInterval = 0.5 / config.intensity
  const lightTypes = [LIGHT_TYPES.LEFT_LASERS, LIGHT_TYPES.BACK_LASERS, LIGHT_TYPES.CENTER_LIGHTS, LIGHT_TYPES.RING_LIGHTS, LIGHT_TYPES.RIGHT_LASERS]
  let currentBeat = 0
  let wavePosition = 0
  let useRed = true
  while (currentBeat < totalBeats) {
    const lightType = lightTypes[wavePosition % lightTypes.length]
    const prevType  = lightTypes[(wavePosition - 1 + lightTypes.length) % lightTypes.length]
    events.push({ _time: currentBeat, _type: lightType, _value: useRed ? LIGHT_VALUES.RED_FADE : LIGHT_VALUES.BLUE_FADE })
    if (wavePosition > 0) events.push({ _time: currentBeat, _type: prevType, _value: LIGHT_VALUES.OFF })
    wavePosition++
    if (wavePosition >= lightTypes.length * 2) { wavePosition = 0; useRed = !useRed }
    currentBeat += waveInterval
  }
  return events
}

function generatePulseEvents(_notes: Note[], config: LightshowConfig, totalBeats: number): LightEvent[] {
  const events: LightEvent[] = []
  const beatsPerPulse = Math.max(0.5, 2 / config.intensity)
  let currentBeat = 0
  let pulseOn = true
  while (currentBeat < totalBeats) {
    [LIGHT_TYPES.BACK_LASERS, LIGHT_TYPES.RING_LIGHTS, LIGHT_TYPES.CENTER_LIGHTS].forEach(lt => {
      events.push({ _time: currentBeat, _type: lt, _value: pulseOn ? LIGHT_VALUES.BLUE_ON : LIGHT_VALUES.OFF })
    })
    pulseOn = !pulseOn
    currentBeat += beatsPerPulse
  }
  return events
}

function generateRainbowEvents(_notes: Note[], config: LightshowConfig, totalBeats: number): LightEvent[] {
  const events: LightEvent[] = []
  const cycleInterval = 1 / config.intensity
  let currentBeat = 0
  let colorPhase = 0
  while (currentBeat < totalBeats) {
    [LIGHT_TYPES.BACK_LASERS, LIGHT_TYPES.LEFT_LASERS, LIGHT_TYPES.RIGHT_LASERS, LIGHT_TYPES.CENTER_LIGHTS].forEach((lt, i) => {
      events.push({ _time: currentBeat, _type: lt, _value: (colorPhase + i) % 2 === 0 ? LIGHT_VALUES.RED_FADE : LIGHT_VALUES.BLUE_FADE })
    })
    colorPhase++
    currentBeat += cycleInterval
  }
  return events
}

function generateRingRotationEvents(totalBeats: number, intensity: number): LightEvent[] {
  const events: LightEvent[] = []
  const interval = Math.max(2, 8 / intensity)
  let currentBeat = 0
  let direction = 1
  while (currentBeat < totalBeats) {
    events.push({ _time: currentBeat, _type: LIGHT_TYPES.RING_ROTATION, _value: direction > 0 ? 1 : 0 })
    direction *= -1
    currentBeat += interval
  }
  return events
}

function generateLaserSpeedEvents(totalBeats: number, intensity: number): LightEvent[] {
  const events: LightEvent[] = []
  const interval = Math.max(4, 16 / intensity)
  const speeds = [0, 2, 4, 6, 8]
  let currentBeat = 0
  let speedIndex = 0
  while (currentBeat < totalBeats) {
    const speed = speeds[speedIndex % speeds.length]
    events.push({ _time: currentBeat, _type: LIGHT_TYPES.LEFT_LASER_SPEED,  _value: speed })
    events.push({ _time: currentBeat, _type: LIGHT_TYPES.RIGHT_LASER_SPEED, _value: speed })
    speedIndex++
    currentBeat += interval
  }
  return events
}

function generateBoostColorEvents(notes: Note[], _intensity: number): LightEvent[] {
  const events: LightEvent[] = []
  const noteDensityThreshold = 4
  let consecutiveNotes = 0
  let boostActive = false
  notes.forEach((note, index) => {
    const nextNote = notes[index + 1]
    const timeDiff = nextNote ? nextNote._time - note._time : 1
    if (timeDiff < 0.5) consecutiveNotes++
    else                consecutiveNotes = 0

    if (consecutiveNotes >= noteDensityThreshold && !boostActive) {
      events.push({ _time: note._time, _type: LIGHT_TYPES.BOOST_COLORS, _value: 1 })
      boostActive = true
    } else if (consecutiveNotes === 0 && boostActive) {
      events.push({ _time: note._time, _type: LIGHT_TYPES.BOOST_COLORS, _value: 0 })
      boostActive = false
    }
  })
  return events
}

export function generatePlaceholderCover(): Uint8Array {
  const width = 256, height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#ff2d55')
  gradient.addColorStop(1, '#007aff')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  for (let i = 0; i < 5; i++) ctx.fillRect(0, (height / 5) * i, width, 2)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BEAT SABER', width / 2, height / 2 - 10)
  ctx.font = '16px sans-serif'
  ctx.fillText('Custom Map', width / 2, height / 2 + 20)
  const dataUrl = canvas.toDataURL('image/png')
  const binary = atob(dataUrl.split(',')[1])
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return array
}

export function generatePlaceholderOgg(): Uint8Array {
  return new Uint8Array([
    0x4f,0x67,0x67,0x53,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x1e,0x01,0x76,
    0x6f,0x72,0x62,0x69,0x73,0x00,0x00,0x00,0x00,0x01,0x44,0xac,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0xee,0x02,0x00,0x00,0x00,0x00,0x00,0xb8,0x01
  ])
}

// ─── Utility ──────────────────────────────────────────────────────────
function roundTo3(n: number): number {
  return Math.round(n * 1000) / 1000
}
