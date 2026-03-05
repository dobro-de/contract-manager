import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type TemplateField = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required: boolean;
};

export async function generateContractPdf(
  templateName: string,
  fields: TemplateField[],
  values: Record<string, string>,
  contractTitle: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Header
  page.drawText("VERTRAGSDOKUMENT", {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 30;

  page.drawText(contractTitle, {
    x: margin,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;

  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 10;

  // Template name
  page.drawText(`Vorlage: ${templateName}`, {
    x: margin,
    y,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 30;

  // Fields
  for (const field of fields) {
    const value = values[field.key] ?? "—";

    // Label
    page.drawText(field.label, {
      x: margin,
      y,
      size: 10,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 18;

    // Value
    if (field.type === "textarea" && value.length > 80) {
      // Wrap long text
      const words = value.split(" ");
      let line = "";
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(testLine, 11) > width - margin * 2) {
          page.drawText(line, { x: margin, y, size: 11, font });
          y -= 16;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, { x: margin, y, size: 11, font });
        y -= 16;
      }
    } else {
      page.drawText(value, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 16;
    }

    y -= 12; // spacing between fields

    // New page if needed
    if (y < margin + 80) {
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }
  }

  // Footer with date
  y -= 20;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 20;

  const now = new Date();
  page.drawText(
    `Generiert am ${now.toLocaleDateString("de-DE")} um ${now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`,
    {
      x: margin,
      y,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    }
  );

  // Signature blocks
  y -= 50;
  const sigWidth = (width - margin * 2 - 40) / 2;

  // Left signature
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + sigWidth, y },
    thickness: 0.5,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText("Auftraggeber", {
    x: margin,
    y: y - 15,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Right signature
  const rightX = margin + sigWidth + 40;
  page.drawLine({
    start: { x: rightX, y },
    end: { x: rightX + sigWidth, y },
    thickness: 0.5,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText("Auftragnehmer", {
    x: rightX,
    y: y - 15,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
