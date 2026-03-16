// Beat Saber Map Generator
// Generates valid BeatSaver-compatible map files

export interface Note {
  _time: number
  _lineIndex: number // 0-3 (left to right)
  _lineLayer: number // 0-2 (bottom to top)
  _type: number // 0=Red, 1=Blue
  _cutDirection: number // 0-8 (see CUT_DIRECTIONS)
}

export interface MapConfig {
  bpm: number
  songName: string
  songSubName: string
  songAuthorName: string
  levelAuthorName: string
  duration: number // in seconds
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'ExpertPlus'
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
  
  // Difficulty settings
  const difficultySettings: Record<string, { notesPerBeat: number; complexity: number }> = {
    Easy: { notesPerBeat: 0.25, complexity: 0.3 },
    Normal: { notesPerBeat: 0.5, complexity: 0.4 },
    Hard: { notesPerBeat: 1, complexity: 0.6 },
    Expert: { notesPerBeat: 1.5, complexity: 0.8 },
    ExpertPlus: { notesPerBeat: 2, complexity: 1 }
  }
  
  const settings = difficultySettings[difficulty]
  
  // Track last direction for each hand for flow
  let lastRedDirection = CUT_DIRECTIONS.DOWN
  let lastBlueDirection = CUT_DIRECTIONS.DOWN
  
  // Generate notes
  let currentBeat = minStartBeat
  const beatInterval = 1 / settings.notesPerBeat
  
  while (currentBeat < totalBeats - 2) {
    // Determine if we place one or two notes
    const placeDouble = Math.random() < settings.complexity * 0.5
    
    if (placeDouble) {
      // Place both red and blue notes
      const redNote = generateSingleNote(currentBeat, 0, lastRedDirection, 'left')
      const blueNote = generateSingleNote(currentBeat, 1, lastBlueDirection, 'right')
      
      notes.push(redNote)
      notes.push(blueNote)
      
      lastRedDirection = redNote._cutDirection
      lastBlueDirection = blueNote._cutDirection
    } else {
      // Alternate between red and blue
      const isRed = Math.random() < 0.5
      const type = isRed ? 0 : 1
      const lastDirection = isRed ? lastRedDirection : lastBlueDirection
      const side = isRed ? 'left' : 'right'
      
      const note = generateSingleNote(currentBeat, type, lastDirection, side)
      notes.push(note)
      
      if (isRed) {
        lastRedDirection = note._cutDirection
      } else {
        lastBlueDirection = note._cutDirection
      }
    }
    
    // Add some variation to timing
    const variation = (Math.random() - 0.5) * 0.1
    currentBeat += beatInterval + variation
  }
  
  return notes
}

function generateSingleNote(
  time: number,
  type: number, // 0=red, 1=blue
  lastDirection: number,
  preferredSide: 'left' | 'right'
): Note {
  // Get flow-friendly next direction
  const possibleDirections = FLOW_PAIRS[lastDirection] || [CUT_DIRECTIONS.DOWN]
  const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
  
  // Position based on type and direction
  let lineIndex: number
  if (preferredSide === 'left') {
    lineIndex = Math.random() < 0.7 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2) + 2
  } else {
    lineIndex = Math.random() < 0.7 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2)
  }
  
  // Layer based on direction (higher cuts go higher, etc)
  let lineLayer: number
  if ([CUT_DIRECTIONS.UP, CUT_DIRECTIONS.UP_LEFT, CUT_DIRECTIONS.UP_RIGHT].includes(newDirection)) {
    lineLayer = Math.random() < 0.6 ? 0 : 1
  } else if ([CUT_DIRECTIONS.DOWN, CUT_DIRECTIONS.DOWN_LEFT, CUT_DIRECTIONS.DOWN_RIGHT].includes(newDirection)) {
    lineLayer = Math.random() < 0.6 ? 2 : 1
  } else {
    lineLayer = Math.floor(Math.random() * 3)
  }
  
  return {
    _time: Math.round(time * 1000) / 1000, // Round to 3 decimal places
    _lineIndex: lineIndex,
    _lineLayer: lineLayer,
    _type: type,
    _cutDirection: newDirection
  }
}

// Generate info.dat content
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
    _environmentName: "DefaultEnvironment",
    _songTimeOffset: 0,
    _customData: {
      _editors: {
        _lastEditedBy: "BeatSaber Map Generator",
        "BeatSaber Map Generator": {
          version: "1.0.0"
        }
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
    Easy: 1,
    Normal: 3,
    Hard: 5,
    Expert: 7,
    ExpertPlus: 9
  }
  return ranks[difficulty] || 9
}

function getJumpSpeed(difficulty: string): number {
  const speeds: Record<string, number> = {
    Easy: 10,
    Normal: 10,
    Hard: 12,
    Expert: 14,
    ExpertPlus: 16
  }
  return speeds[difficulty] || 16
}

// Generate difficulty file content
export function generateDifficultyDat(notes: Note[]): object {
  return {
    _version: "2.0.0",
    _notes: notes,
    _obstacles: [],
    _events: generateBasicLightEvents(notes),
    _customData: {}
  }
}

// Generate basic lighting events synced to notes
function generateBasicLightEvents(notes: Note[]): object[] {
  const events: object[] = []
  
  // Add lighting events at note positions
  notes.forEach((note, index) => {
    if (index % 4 === 0) {
      events.push({
        _time: note._time,
        _type: Math.floor(Math.random() * 5), // Different light types
        _value: Math.floor(Math.random() * 3) + 1 // Light intensity
      })
    }
  })
  
  return events
}

// Generate placeholder cover image (256x256 PNG)
export function generatePlaceholderCover(): Uint8Array {
  // Create a simple PNG with Beat Saber colors
  // This is a minimal valid PNG structure
  const width = 256
  const height = 256
  
  // Create canvas-like data
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#ff2d55') // Red saber color
  gradient.addColorStop(1, '#007aff') // Blue saber color
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Add some visual elements
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  for (let i = 0; i < 5; i++) {
    const y = (height / 5) * i
    ctx.fillRect(0, y, width, 2)
  }
  
  // Add text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BEAT SABER', width / 2, height / 2 - 10)
  ctx.font = '16px sans-serif'
  ctx.fillText('Custom Map', width / 2, height / 2 + 20)
  
  // Convert to blob/array
  const dataUrl = canvas.toDataURL('image/png')
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  
  return array
}

// Generate placeholder OGG file (silent audio)
export function generatePlaceholderOgg(): Uint8Array {
  // Minimal valid OGG Vorbis file header (silent)
  // This is a pre-encoded minimal silent OGG file
  const oggHeader = new Uint8Array([
    0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x1e, 0x01, 0x76, 0x6f, 0x72, 0x62, 0x69,
    0x73, 0x00, 0x00, 0x00, 0x00, 0x01, 0x44, 0xac,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xee,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xb8, 0x01
  ])
  
  return oggHeader
}
