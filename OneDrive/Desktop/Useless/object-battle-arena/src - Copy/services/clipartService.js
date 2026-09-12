import { removeBackground } from '@imgly/background-removal'

const WARMUP_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/Scx8WQAAAABJRU5ErkJggg=='
let preloadPromise

export function preloadBackgroundRemoval() {
  if (!preloadPromise) {
    preloadPromise = removeBackground(WARMUP_IMAGE, { output: { format: 'image/png' } }).catch(() => null)
  }
  return preloadPromise
}

export async function createObjectClipart(imageDataUrl) {
  const blob = await removeBackground(imageDataUrl, { output: { format: 'image/png' } })
  return blobToDataUrl(blob)
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
