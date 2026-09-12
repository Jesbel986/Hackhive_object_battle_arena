import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const OUTPUT_SIZE = 512
const HANDLE_EPSILON = 0.001

/** Handles: 4 corners + 4 edges. 'move' drags the whole box. */
const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize' },
  { id: 'n', cursor: 'ns-resize' },
  { id: 'ne', cursor: 'nesw-resize' },
  { id: 'e', cursor: 'ew-resize' },
  { id: 'se', cursor: 'nwse-resize' },
  { id: 's', cursor: 'ns-resize' },
  { id: 'sw', cursor: 'nesw-resize' },
  { id: 'w', cursor: 'ew-resize' },
]

/**
 * Clamp a crop rect (in 0..1 image-relative units) to the image bounds.
 * Keeps width/height at least MIN and never exceeds the edges.
 */
function clampCrop(crop) {
  const width = Math.min(1 - HANDLE_EPSILON, Math.max(0.1, crop.width))
  const height = Math.min(1 - HANDLE_EPSILON, Math.max(0.1, crop.height))
  const x = Math.min(1 - width, Math.max(0, crop.x))
  const y = Math.min(1 - height, Math.max(0, crop.y))
  return { x, y, width, height }
}

/**
 * Client-side crop editor. The crop BOX is draggable and resizable from all
 * sides/corners; the image can also be zoomed. Everything stays local — the
 * result is a square JPEG data URL rendered on canvas.
 */
export default function CropEditor({ imageSrc, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0.15, y: 0.1, width: 0.7, height: 0.8 })
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(null) // handle id | 'move' | null
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const imageRef = useRef(null)
  const stageRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const image = new Image()
    image.onload = () => setNatural({ width: image.naturalWidth, height: image.naturalHeight })
    image.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    const element = stageRef.current
    if (!element) return undefined
    const update = () => setStage({ width: element.clientWidth, height: element.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /** Scale at which the full image fits inside the stage, times zoom. */
  const coverScale = useMemo(() => {
    if (!natural.width || !stage.width) return 1
    return Math.min(stage.width / natural.width, stage.height / natural.height) * zoom
  }, [natural, stage, zoom])

  const drawn = { width: natural.width * coverScale, height: natural.height * coverScale }
  // Center the drawn image in the stage; overflow hides outside.
  const imageLeft = (stage.width - drawn.width) / 2
  const imageTop = (stage.height - drawn.height) / 2

  /** Convert a pointer event + stage rect to stage-relative pixels. */
  const pointFromEvent = (event, rect) => {
    const source = event.touches?.[0] || event
    return { x: source.clientX - rect.left, y: source.clientY - rect.top }
  }

  const cropPixel = {
    x: imageLeft + crop.x * drawn.width,
    y: imageTop + crop.y * drawn.height,
    width: crop.width * drawn.width,
    height: crop.height * drawn.height,
  }

  const onPointerDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const handleId = event.currentTarget.dataset.handle || 'move'
    const rect = stageRef.current.getBoundingClientRect()
    const start = pointFromEvent(event, rect)
    dragRef.current = { handle: handleId, start, startCrop: { ...crop } }
    setDragging(handleId)
  }

  const onPointerMove = (event) => {
    if (!dragging || !dragRef.current || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const point = pointFromEvent(event, rect)
    const { handle, start, startCrop } = dragRef.current
    const dx = (point.x - start.x) / Math.max(1, drawn.width)
    const dy = (point.y - start.y) / Math.max(1, drawn.height)

    if (handle === 'move') {
      setCrop(clampCrop({ ...startCrop, x: startCrop.x + dx, y: startCrop.y + dy }))
      return
    }

    let { x, y, width, height } = startCrop
    if (handle.includes('w')) { x = startCrop.x + dx; width = startCrop.width - dx }
    if (handle.includes('e')) { width = startCrop.width + dx }
    if (handle.includes('n')) { y = startCrop.y + dy; height = startCrop.height - dy }
    if (handle.includes('s')) { height = startCrop.height + dy }
    setCrop(clampCrop({ x, y, width, height }))
  }

  const endDrag = () => {
    setDragging(null)
    dragRef.current = null
  }

  const onWheel = (event) => {
    event.preventDefault()
    setZoom((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.12 : -0.12))))
  }

  const reset = () => {
    setCrop({ x: 0.15, y: 0.1, width: 0.7, height: 0.8 })
    setZoom(1)
  }

  /** Center a square crop on the current crop's midpoint. */
  const squareize = () => {
    const side = Math.min(crop.width, crop.height)
    const centerX = crop.x + crop.width / 2
    const centerY = crop.y + crop.height / 2
    setCrop(clampCrop({ x: centerX - side / 2, y: centerY - side / 2, width: side, height: side }))
  }

  /** Cut the crop rect out of the image and return a square data URL. */
  const confirm = useCallback(() => {
    const source = imageRef.current
    if (!source?.naturalWidth || !stage.width) return
    const cropX = (crop.x / Math.max(HANDLE_EPSILON, 1)) * natural.width
    const cropY = crop.y * natural.height
    const cropWidth = crop.width * natural.width
    const cropHeight = crop.height * natural.height
    // Keep the existing square output contract while preserving a freeform crop.
    const side = Math.round(Math.max(cropWidth, cropHeight))
    const outputWidth = Math.round((cropWidth / side) * OUTPUT_SIZE)
    const outputHeight = Math.round((cropHeight / side) * OUTPUT_SIZE)
    const outputX = Math.round((OUTPUT_SIZE - outputWidth) / 2)
    const outputY = Math.round((OUTPUT_SIZE - outputHeight) / 2)

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    context.drawImage(source, Math.round(cropX), Math.round(cropY), Math.round(cropWidth), Math.round(cropHeight), outputX, outputY, outputWidth, outputHeight)
    onConfirm(canvas.toDataURL('image/jpeg', 0.88))
  }, [crop, natural, stage, onConfirm])

  return (
    <div className="crop-editor" role="dialog" aria-label="Crop object photo">
      <div className="crop-heading">
        <p className="kicker">FRAME THE OBJECT</p>
        <h3>CROP YOUR <em>FIGHTER.</em></h3>
        <p className="crop-hint">FREEFORM FRAME · DRAG EDGES HORIZONTALLY OR VERTICALLY · SCROLL TO ZOOM</p>
      </div>
      <div className="crop-stage" ref={stageRef} onWheel={onWheel}>
        <img
          ref={imageRef}
          className="crop-image"
          src={imageSrc}
          alt="Captured object"
          draggable={false}
          style={{
            width: drawn.width || undefined,
            height: drawn.height || undefined,
            left: imageLeft,
            top: imageTop,
          }}
        />
        {stage.width > 0 && (
          <div
            className={`crop-box ${dragging === 'move' ? 'dragging' : ''}`}
            style={{ left: cropPixel.x, top: cropPixel.y, width: cropPixel.width, height: cropPixel.height }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="crop-rule thirds-h" /><div className="crop-rule thirds-h bottom" />
            <div className="crop-rule thirds-v" /><div className="crop-rule thirds-v right" />
            {HANDLES.map((handle) => (
              <i
                key={handle.id}
                className={`crop-handle ${handle.id}`}
                data-handle={handle.id}
                style={{ cursor: handle.cursor }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            ))}
          </div>
        )}
      </div>
      <div className="crop-dimensions" aria-live="polite"><span>WIDTH {Math.round(crop.width * 100)}%</span><span>HEIGHT {Math.round(crop.height * 100)}%</span><small>FREEFORM</small></div>
      <div className="crop-controls">
        <label className="crop-zoom">
          <span>ZOOM</span>
          <input type="range" min={1} max={4} step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
          <b>{Math.round(zoom * 100)}%</b>
        </label>
        <div className="crop-buttons">
          <button type="button" className="secondary-button" onClick={squareize}>SQUARE</button>
          <button type="button" className="secondary-button" onClick={reset}>RESET</button>
          <button type="button" className="secondary-button" onClick={onCancel}>RETAKE</button>
          <button type="button" className="primary-button" onClick={confirm}>CONFIRM CROP →</button>
        </div>
      </div>
    </div>
  )
}
