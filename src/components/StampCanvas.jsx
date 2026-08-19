import { useEffect, useRef, useState } from 'react'
import pdfjsLib from '../lib/pdfjs-setup'

/**
 * Renders the first page of a reference PDF and lets the user drag/resize
 * each stamp image on top of it. Positions are reported back as
 * percentages of the page size, so they stay correct across PDFs of
 * different dimensions.
 */
export default function StampCanvas({ pdfFile, stamps, onChange }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [pageSize, setPageSize] = useState(null)
  const dragState = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!pdfFile) return
      const buffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1 })

      const maxWidth = 480
      const scale = maxWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })

      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise

      if (!cancelled) {
        setPageSize({ width: scaledViewport.width, height: scaledViewport.height })
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [pdfFile])

  function startDrag(e, stampId) {
    e.preventDefault()
    const container = containerRef.current.getBoundingClientRect()
    dragState.current = { stampId, container }
    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', endDrag)
  }

  function onDrag(e) {
    const { stampId, container } = dragState.current
    const xPct = clamp(((e.clientX - container.left) / container.width) * 100, 0, 100)
    const yPct = clamp(((e.clientY - container.top) / container.height) * 100, 0, 100)
    onChange(stampId, { xPct, yPct })
  }

  function endDrag() {
    dragState.current = null
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', endDrag)
  }

  if (!pdfFile) {
    return <div className="stamp-canvas-placeholder">Upload a PDF to position your stamps</div>
  }

  return (
    <div className="stamp-canvas" ref={containerRef}>
      <canvas ref={canvasRef} />
      {pageSize &&
        stamps.map((stamp) => (
          <img
            key={stamp.id}
            src={stamp.previewUrl}
            alt={stamp.name}
            className="stamp-handle"
            onPointerDown={(e) => startDrag(e, stamp.id)}
            style={{
              left: `${stamp.xPct}%`,
              top: `${stamp.yPct}%`,
              width: `${stamp.widthPct}%`,
              height: `${stamp.heightPct}%`,
            }}
          />
        ))}
    </div>
  )
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
