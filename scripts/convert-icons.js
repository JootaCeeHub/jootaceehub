#!/usr/bin/env node
/**
 * scripts/convert-icons.js
 *
 * Converts PWA PNG icons to WebP for reduced file size.
 * Requires: `convert` from ImageMagick (already installed for original icon generation)
 *
 * Usage:
 *   npm run convert-icons
 *
 * Run AFTER `npm run build` to add WebP variants alongside PNG originals.
 * PNG files are kept for maximum PWA compatibility (Safari requires PNG in manifest).
 * WebP files can be referenced in <picture> elements for modern browsers.
 */

const { execSync, execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public')

const ICONS = [
  { src: 'icon-192x192.png',    dest: 'icon-192x192.webp',    quality: 90 },
  { src: 'icon-512x512.png',    dest: 'icon-512x512.webp',    quality: 90 },
  { src: 'apple-touch-icon.png',dest: 'apple-touch-icon.webp',quality: 85 },
  { src: 'maskable-icon.png',   dest: 'maskable-icon.webp',   quality: 85 },
]

function checkImageMagick() {
  try {
    execFileSync('convert', ['--version'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function checkSharp() {
  try {
    require.resolve('sharp')
    return true
  } catch {
    return false
  }
}

async function convertWithSharp() {
  const sharp = require('sharp')
  let converted = 0

  for (const { src, dest, quality } of ICONS) {
    const inputPath  = path.join(PUBLIC_DIR, src)
    const outputPath = path.join(PUBLIC_DIR, dest)

    if (!fs.existsSync(inputPath)) {
      console.warn(`  ⚠  Skipping ${src} — file not found`)
      continue
    }

    await sharp(inputPath)
      .webp({ quality, lossless: false, effort: 6 })
      .toFile(outputPath)

    const inputSize  = fs.statSync(inputPath).size
    const outputSize = fs.statSync(outputPath).size
    const savings    = Math.round((1 - outputSize / inputSize) * 100)

    console.log(`  ✓  ${src} → ${dest}  (${savings}% smaller: ${inputSize}B → ${outputSize}B)`)
    converted++
  }

  return converted
}

function convertWithImageMagick() {
  let converted = 0

  for (const { src, dest, quality } of ICONS) {
    const inputPath  = path.join(PUBLIC_DIR, src)
    const outputPath = path.join(PUBLIC_DIR, dest)

    if (!fs.existsSync(inputPath)) {
      console.warn(`  ⚠  Skipping ${src} — file not found`)
      continue
    }

    try {
      execFileSync('convert', [
        inputPath,
        '-quality', String(quality),
        '-define', `webp:lossless=false`,
        outputPath,
      ])

      const inputSize  = fs.statSync(inputPath).size
      const outputSize = fs.statSync(outputPath).size
      const savings    = Math.round((1 - outputSize / inputSize) * 100)

      console.log(`  ✓  ${src} → ${dest}  (${savings}% smaller: ${inputSize}B → ${outputSize}B)`)
      converted++
    } catch (err) {
      console.error(`  ✗  Failed to convert ${src}:`, err.message)
    }
  }

  return converted
}

async function main() {
  console.log('\n🖼  Converting PWA icons to WebP...\n')

  if (checkSharp()) {
    console.log('  Using: sharp (npm package)')
    const count = await convertWithSharp()
    console.log(`\n  Done. ${count}/${ICONS.length} icons converted.\n`)
  } else if (checkImageMagick()) {
    console.log('  Using: ImageMagick (system)')
    const count = convertWithImageMagick()
    console.log(`\n  Done. ${count}/${ICONS.length} icons converted.\n`)
  } else {
    // Emit a non-fatal warning — CI environments may not have ImageMagick.
    // WebP conversion is a progressive enhancement, not a build requirement.
    console.warn(
      '\n  ⚠  Skipping WebP conversion — neither sharp nor ImageMagick found.\n' +
      '  For local optimization, install one of:\n' +
      '    npm install -D sharp\n' +
      '    sudo apt install imagemagick  # or brew install imagemagick\n'
    )
  }

  // Print summary of WebP files
  console.log('  WebP files created in /public:')
  ICONS.forEach(({ dest }) => {
    const p = path.join(PUBLIC_DIR, dest)
    if (fs.existsSync(p)) {
      console.log(`    /public/${dest}  (${fs.statSync(p).size}B)`)
    }
  })
  console.log()
}

main().catch((err) => {
  console.error('  Fatal:', err)
  process.exit(1)
})
