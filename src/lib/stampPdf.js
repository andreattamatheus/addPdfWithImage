import { PDFDocument } from 'pdf-lib'

/**
 * Embeds one or more image "stamps" onto the pages of a PDF.
 * Stamp position/size are stored as percentages of the page's own
 * width/height, so the same stamp config works across PDFs with
 * different page sizes.
 *
 * @param {ArrayBuffer} pdfBytes
 * @param {Array<{
 *   imageBytes: ArrayBuffer,
 *   imageKind: 'png' | 'jpg',
 *   xPct: number, yPct: number,
 *   widthPct: number, heightPct: number,
 *   target: 'first' | 'last' | 'all',
 * }>} stamps
 */
export async function stampPdf(pdfBytes, stamps) {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pageCount = pdfDoc.getPageCount()

  const embedded = await Promise.all(
    stamps.map(async (stamp) => ({
      stamp,
      image:
        stamp.imageKind === 'jpg'
          ? await pdfDoc.embedJpg(stamp.imageBytes)
          : await pdfDoc.embedPng(stamp.imageBytes),
    })),
  )

  for (const { stamp, image } of embedded) {
    const pageIndexes = resolveTargetPages(stamp.target, pageCount)

    for (const pageIndex of pageIndexes) {
      const page = pdfDoc.getPage(pageIndex)
      const { width: pageWidth, height: pageHeight } = page.getSize()

      const width = (stamp.widthPct / 100) * pageWidth
      const height = (stamp.heightPct / 100) * pageHeight
      const x = (stamp.xPct / 100) * pageWidth
      // yPct is measured from the top of the page in the editor,
      // pdf-lib draws from the bottom-left origin.
      const y = pageHeight - (stamp.yPct / 100) * pageHeight - height

      page.drawImage(image, { x, y, width, height })
    }
  }

  return pdfDoc.save()
}

function resolveTargetPages(target, pageCount) {
  if (target === 'first') return [0]
  if (target === 'last') return [pageCount - 1]
  return Array.from({ length: pageCount }, (_, i) => i)
}
