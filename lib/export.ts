import { jsPDF } from "jspdf";
import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";

export async function exportSlidesToPDF(slides: any[], title: string) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });
  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage([1280, 720], "landscape");
    pdf.setFillColor(30, 27, 75);
    pdf.rect(0, 0, 1280, 720, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(44);
    pdf.text(slides[i].title || "Slide " + (i + 1), 80, 180);
    pdf.setFontSize(20);
    pdf.setTextColor(196, 181, 253);
    (slides[i].elements || [])
      .filter((e: any) => e.type === "text" && e.text)
      .slice(1, 8)
      .forEach((e: any, j: number) => { 
        pdf.text("• " + e.text, 80, 260 + j * 40); 
      });
  }
  pdf.save(title.replace(/\s+/g, "_") + ".pdf");
}

export async function exportSlidesToPPTX(slides: any[], title: string) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";
  slides.forEach((s) => {
    const slide = pptx.addSlide();
    slide.background = { color: "1e1b4b" };
    slide.addShape(pptx.Enum.ShapeType.RECT, { x: 0, y: 7.3, w: 13.33, h: 0.2, fill: { color: "5a8dff" } });
    slide.addText(s.title || "", { x: 0.5, y: 0.8, w: 12.3, fontSize: 36, color: "ffffff", bold: true });
    const textEls = (s.elements || []).filter((e: any) => e.type === "text" && e.text).slice(1);
    if (textEls.length) {
      slide.addText(
        textEls.map((e: any) => ({ text: "• " + e.text, options: { fontSize: 18, color: "c4b5fd" } })),
        { x: 0.5, y: 2.2, w: 12.3, h: 4.5 }
      );
    }
    if (s.notes) slide.addNotes(s.notes);
  });
  await pptx.writeFile({ fileName: title.replace(/\s+/g, "_") + ".pptx" });
}

export async function captureToBase64(el: HTMLElement): Promise<string> {
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
  return canvas.toDataURL("image/png");
}
