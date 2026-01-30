function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportChartAsSvg(container: HTMLElement, fileName: string) {
  const svg = container.querySelector('svg')
  if (!svg) return
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, fileName)
}

export function exportChartAsPng(container: HTMLElement, fileName: string) {
  const svg = container.querySelector('svg')
  if (!svg) return
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  const width = container.clientWidth || 800
  const height = container.clientHeight || 400

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, fileName)
      URL.revokeObjectURL(url)
    })
  }

  img.src = url
}

export function exportChartDataAsCsv(data: Array<Record<string, string | number>>, fileName: string) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => `${row[h] ?? ''}`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, fileName)
}
