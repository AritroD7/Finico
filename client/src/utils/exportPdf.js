import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function exportElementToPDF(el, filename = "report.pdf") {
  const canvas = await html2canvas(el, { scale: 2 })
  const img = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  pdf.addImage(img, "PNG", (pageW - w) / 2, 40, w, h)
  pdf.save(filename)
}
