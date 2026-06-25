/**
 * Generate placeholder sound effects as MP3 files.
 * These are simple synthesized tones — replace with real SFX later.
 *
 * Uses the Web Audio API approach to generate tones, then saves as MP3.
 * For simplicity, we generate tiny WAV files (header + PCM data).
 */
const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, '..', 'public', 'sounds')

// WAV file generator
function createWav(sampleRate = 22050, durationSec = 0.2, generator) {
  const numSamples = Math.floor(sampleRate * durationSec)
  const dataSize = numSamples * 2 // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize)

  // WAV header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // chunk size
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buffer.writeUInt16LE(2, 32) // block align
  buffer.writeUInt16LE(16, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const sample = Math.max(-1, Math.min(1, generator(t, durationSec)))
    const int16 = Math.floor(sample * 32767)
    buffer.writeInt16LE(int16, 44 + i * 2)
  }

  return buffer
}

// Tone generators
function sineTone(freq, decay = 5) {
  return (t, dur) => {
    const envelope = Math.exp(-t * decay) * Math.min(1, t * 50) // attack + decay
    return Math.sin(2 * Math.PI * freq * t) * envelope
  }
}

function ascendingTone(startFreq, endFreq, decay = 4) {
  return (t, dur) => {
    const envelope = Math.exp(-t * decay) * Math.min(1, t * 50)
    const freq = startFreq + (endFreq - startFreq) * (t / dur)
    return Math.sin(2 * Math.PI * freq * t) * envelope
  }
}

function descendingTone(startFreq, endFreq, decay = 4) {
  return (t, dur) => {
    const envelope = Math.exp(-t * decay) * Math.min(1, t * 50)
    const freq = startFreq + (endFreq - startFreq) * (t / dur)
    return Math.sin(2 * Math.PI * freq * t) * envelope
  }
}

function chordTone(freqs, decay = 4) {
  return (t, dur) => {
    const envelope = Math.exp(-t * decay) * Math.min(1, t * 50)
    let val = 0
    for (const f of freqs) {
      val += Math.sin(2 * Math.PI * f * t)
    }
    return (val / freqs.length) * envelope
  }
}

function noiseBurst(decay = 15) {
  return (t, _dur) => {
    const envelope = Math.exp(-t * decay)
    return (Math.random() * 2 - 1) * envelope * 0.3
  }
}

function clickTone() {
  return (t, _dur) => {
    const envelope = Math.exp(-t * 30)
    return Math.sin(2 * Math.PI * 800 * t) * envelope * 0.5
  }
}

function buzzTone(freq = 150, decay = 8) {
  return (t, _dur) => {
    const envelope = Math.exp(-t * decay)
    // Square-ish wave for buzzy sound
    const raw = Math.sin(2 * Math.PI * freq * t)
    const square = raw > 0 ? 1 : -1
    return (square * 0.3 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.2) * envelope
  }
}

function arpeggioTone(freqs, noteDur = 0.08, decay = 4) {
  return (t, _dur) => {
    const noteIndex = Math.floor(t / noteDur)
    const noteT = t - noteIndex * noteDur
    if (noteIndex >= freqs.length) return 0
    const envelope = Math.exp(-noteT * decay) * Math.min(1, noteT * 100)
    return Math.sin(2 * Math.PI * freqs[noteIndex] * noteT) * envelope
  }
}

// Define all sounds
const sounds = {
  click: { gen: clickTone(), dur: 0.08 },
  num_press: { gen: sineTone(600, 20), dur: 0.06 },
  correct: { gen: ascendingTone(440, 880, 6), dur: 0.2 },
  wrong: { gen: buzzTone(180, 8), dur: 0.25 },
  hit_normal: {
    gen: (t, dur) => {
      const env = Math.exp(-t * 12) * Math.min(1, t * 80)
      return (Math.sin(2 * Math.PI * 200 * t) + Math.random() * 0.3) * env * 0.5
    },
    dur: 0.15,
  },
  hit_skill: {
    gen: (t, dur) => {
      const env = Math.exp(-t * 8) * Math.min(1, t * 60)
      const freq = 300 - t * 400
      return (Math.sin(2 * Math.PI * freq * t) + Math.random() * 0.2) * env * 0.6
    },
    dur: 0.3,
  },
  boss_hit: {
    gen: (t, dur) => {
      const env = Math.exp(-t * 10) * Math.min(1, t * 50)
      return (Math.sin(2 * Math.PI * 100 * t) * 0.6 + Math.random() * 0.2) * env * 0.5
    },
    dur: 0.2,
  },
  boss_defeat: { gen: arpeggioTone([523, 659, 784, 1047, 1319], 0.1, 3), dur: 0.6 },
  combo_3: { gen: arpeggioTone([440, 554, 659], 0.08, 5), dur: 0.3 },
  combo_5: { gen: arpeggioTone([440, 523, 587, 659, 784], 0.06, 5), dur: 0.35 },
  combo_7: { gen: arpeggioTone([440, 494, 523, 587, 659, 698, 784, 880], 0.05, 4), dur: 0.45 },
  box_open: {
    gen: (t, dur) => {
      const env = Math.exp(-t * 5)
      const creak = Math.sin(2 * Math.PI * (1200 + t * 800) * t) * 0.3
      const pop = t > 0.1 ? Math.exp(-(t - 0.1) * 15) * Math.sin(2 * Math.PI * 600 * t) * 0.4 : 0
      return (creak + pop) * env
    },
    dur: 0.4,
  },
  wheel_tick: { gen: clickTone(), dur: 0.04 },
  wheel_win: { gen: arpeggioTone([523, 659, 784, 1047], 0.1, 4), dur: 0.5 },
  confetti: { gen: noiseBurst(12), dur: 0.15 },
  checkin: { gen: arpeggioTone([660, 880], 0.1, 5), dur: 0.25 },
  points_gain: {
    gen: (t, _dur) => {
      const env = Math.exp(-t * 8)
      const coin1 = Math.sin(2 * Math.PI * 1200 * t) * 0.3
      const coin2 = Math.sin(2 * Math.PI * 1800 * t) * 0.2
      return (coin1 + coin2) * env
    },
    dur: 0.2,
  },
  level_up: { gen: arpeggioTone([523, 659, 784, 1047, 1319, 1568], 0.08, 3), dur: 0.6 },
}

// Generate all files
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

for (const [name, { gen, dur }] of Object.entries(sounds)) {
  const wav = createWav(22050, dur, gen)
  const filePath = path.join(outputDir, `${name}.mp3`) // .mp3 extension for Howler compat (WAV content)
  fs.writeFileSync(filePath, wav)
  console.log(`  ✓ ${name}.mp3 (${(wav.length / 1024).toFixed(1)}KB)`)
}

console.log(`\nGenerated ${Object.keys(sounds).length} sound files in ${outputDir}`)
