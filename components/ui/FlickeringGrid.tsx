import React, { useRef, useEffect } from 'react'

interface FlickeringGridProps {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  maxOpacity?: number
  color?: string
  fps?: number
  className?: string
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.03,
  maxOpacity = 0.35,
  color = '#6B7280',
  fps = 8,
  className = '',
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const cfg = { squareSize, gridGap, flickerChance, maxOpacity, color }
    let cols = 0
    let rows = 0
    let squares: Float32Array
    let dpr = 1
    let running = true
    let imageData: ImageData | null = null
    let r = 107
    let g = 114
    let b = 128

    function parseColor(c: string) {
      const temp = document.createElement('canvas')
      temp.width = temp.height = 1
      const cx = temp.getContext('2d')!
      cx.fillStyle = c
      cx.fillRect(0, 0, 1, 1)
      const [rr, gg, bb] = Array.from(cx.getImageData(0, 0, 1, 1).data)
      r = rr
      g = gg
      b = bb
    }

    function setup() {
      dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      cols = Math.floor(w / (cfg.squareSize + cfg.gridGap))
      rows = Math.floor(h / (cfg.squareSize + cfg.gridGap))
      if (cols < 1 || rows < 1) return
      squares = new Float32Array(cols * rows)
      for (let i = 0; i < squares.length; i++)
        squares[i] = Math.random() * cfg.maxOpacity
      parseColor(cfg.color)
      imageData = ctx.createImageData(canvas.width, canvas.height)
    }

    function draw(dt: number) {
      if (!imageData) return
      const data = imageData.data
      const w = canvas.width
      const h = canvas.height
      const sqPx = cfg.squareSize * dpr
      const gapPx = cfg.gridGap * dpr
      const step = sqPx + gapPx

      // Clear ImageData (all zeros = transparent black)
      data.fill(0)

      // Update squares + render in one pass
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j
          if (Math.random() < cfg.flickerChance * dt)
            squares[idx] = Math.random() * cfg.maxOpacity
          const alpha = Math.round(squares[idx] * 255)
          if (alpha < 1) continue

          const startX = Math.round(i * step)
          const startY = Math.round(j * step)

          for (let dy = 0; dy < sqPx; dy++) {
            const py = startY + dy
            if (py >= h) break
            const rowOffset = py * w * 4
            for (let dx = 0; dx < sqPx; dx++) {
              const px = startX + dx
              if (px >= w) break
              const pi = rowOffset + px * 4
              data[pi] = r
              data[pi + 1] = g
              data[pi + 2] = b
              data[pi + 3] = alpha
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const interval = 1000 / fps
    let last = 0
    function loop(t: number) {
      if (!running) return
      requestAnimationFrame(loop)
      const elapsed = t - last
      if (elapsed < interval) return
      const dt = elapsed / 1000
      last = t - (elapsed % interval)
      draw(dt)
    }

    setup()
    requestAnimationFrame(loop)

    const onResize = () => setup()
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      window.removeEventListener('resize', onResize)
    }
  }, [squareSize, gridGap, flickerChance, maxOpacity, color, fps])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}