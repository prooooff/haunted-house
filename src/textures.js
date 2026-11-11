import * as THREE from 'three'

// Генерація процедурних текстур (CanvasTexture) — без зовнішніх файлів.
// Всі текстури повторюються (RepeatWrapping) і в sRGB-просторі.

function makeCanvas(size, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** Цегляна кладка. */
export function brickTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#5a3528'
    ctx.fillRect(0, 0, s, s)
    const bh = 32
    const bw = 64
    for (let y = 0; y < s; y += bh) {
      const off = ((y / bh) % 2) * (bw / 2)
      for (let x = -bw; x < s + bw; x += bw) {
        ctx.fillStyle = `hsl(${14 + Math.random() * 6}, 45%, ${34 + Math.random() * 14}%)`
        ctx.fillRect(x + off + 2, y + 2, bw - 4, bh - 4)
      }
    }
  })
}

/** Черепиця даху. */
export function roofTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#3a2f28'
    ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += 24) {
      for (let x = 0; x < s; x += 40) {
        ctx.fillStyle = `hsl(${22 + Math.random() * 8}, 25%, ${20 + Math.random() * 8}%)`
        ctx.beginPath()
        ctx.arc(x + 20, y + 24, 19, Math.PI, 0)
        ctx.fill()
      }
    }
  })
}

/** Дерев'яні дошки. */
export function woodTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#6b4a2f'
    ctx.fillRect(0, 0, s, s)
    for (let x = 0; x < s; x += 32) {
      ctx.fillStyle = `hsl(24, 40%, ${35 + Math.random() * 12}%)`
      ctx.fillRect(x + 2, 0, 28, s)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(x + 28, 0, 2, s)
    }
  })
}

/** Трава із зернистістю. */
export function grassTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#2f4f2f'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 3200; i++) {
      const g = 60 + Math.random() * 45
      ctx.fillStyle = `rgba(${18 + Math.random() * 14}, ${g}, ${28 + Math.random() * 12}, 0.35)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2)
    }
  })
}

/** Камінь (плямистий). */
export function stoneTexture() {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#6e6e6e'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `hsl(0, 0%, ${45 + Math.random() * 20}%)`
      ctx.beginPath()
      ctx.arc(Math.random() * s, Math.random() * s, 10 + Math.random() * 30, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** Дерев'яна табличка з написом. */
export function signTexture(text = 'RIP') {
  return makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#6b4a2f'
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    ctx.lineWidth = 6
    ctx.strokeRect(8, 8, s - 16, s - 16)
    ctx.fillStyle = '#2a1c12'
    ctx.font = 'bold 60px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, s / 2, s / 2)
  })
}
