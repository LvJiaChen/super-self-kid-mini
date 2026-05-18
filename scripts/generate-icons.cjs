const { deflateSync } = require('zlib')
const { writeFileSync } = require('fs')
const { resolve } = require('path')

const publicDir = resolve(process.cwd(), 'public')

function crc32(buf) {
  let c
  const table = Array(256)
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeData = Buffer.concat([Buffer.from(type), data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(typeData), 0)
  return Buffer.concat([len, typeData, crcBuf])
}

function createPNG(size, bgR, bgG, bgB, iconG, iconB) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  const cx = size / 2, cy = size / 2, r = size * 0.35

  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter none
    const rowOff = y * (size * 4 + 1) + 1
    for (let x = 0; x < size; x++) {
      const off = rowOff + x * 4
      const dx = (x - cx) / r, dy = (y - cy) / r
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 0.75) {
        // Inside circle: white
        raw[off] = 255; raw[off + 1] = 255; raw[off + 2] = 255; raw[off + 3] = 255
      } else if (dist < 1.0) {
        // Anti-alias edge
        const t = (dist - 0.75) / 0.25
        raw[off] = bgR + (255 - bgR) * (1 - t) | 0
        raw[off + 1] = bgG + (255 - bgG) * (1 - t) | 0
        raw[off + 2] = bgB + (255 - bgB) * (1 - t) | 0
        raw[off + 3] = 255
      } else {
        // Background
        raw[off] = bgR; raw[off + 1] = bgG; raw[off + 2] = bgB; raw[off + 3] = 255
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

// Orange background (#ff6b35) with white circle (simple star placeholder)
writeFileSync(publicDir + '/pwa-192x192.png', createPNG(192, 255, 107, 53))
writeFileSync(publicDir + '/pwa-512x512.png', createPNG(512, 255, 107, 53))

console.log('PWA icons generated!')
