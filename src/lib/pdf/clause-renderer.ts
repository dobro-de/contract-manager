import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";

export type Clause = {
  title: string;
  text: string; // Kann {{platzhalter}} enthalten
};

export type TemplateField = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required: boolean;
};

export async function generateClausePdf(
  contractTitle: string,
  templateName: string,
  clauses: Clause[],
  fields: TemplateField[],
  values: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const W = 595.28;
  const H = 841.89;
  const M = 55; // margin
  const TW = W - M * 2; // text width
  const black = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.4, 0.4, 0.4);
  const light = rgb(0.78, 0.78, 0.78);

  let page = pdfDoc.addPage([W, H]);
  let y = H - M;
  let pageNum = 1;

  function ensureSpace(needed: number) {
    if (y < M + needed) {
      // Footer on current page
      drawFooter(page, pageNum);
      pageNum++;
      page = pdfDoc.addPage([W, H]);
      y = H - M;
    }
  }

  function drawFooter(p: PDFPage, num: number) {
    p.drawText(`Seite ${num} · ${contractTitle} · Vertraulich`, {
      x: M, y: M - 20, size: 7, font, color: light,
    });
  }

  function drawWrapped(text: string, size: number, f: PDFFont, color = black, indent = 0) {
    const maxW = TW - indent;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxW) {
        ensureSpace(size + 4);
        page.drawText(line, { x: M + indent, y, size, font: f, color });
        y -= size + 4;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ensureSpace(size + 4);
      page.drawText(line, { x: M + indent, y, size, font: f, color });
      y -= size + 4;
    }
  }

  // Replace {{placeholders}} with values
  function replacePlaceholders(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const val = values[key]?.trim();
      if (val) return val;
      // Find label for empty field
      const field = fields.find((f) => f.key === key);
      return field ? `[${field.label}]` : `[${key}]`;
    });
  }

  // ─── Header ─────────────────────────────────────────────────────────────────

  page.drawText(templateName.toUpperCase(), {
    x: M, y, size: 9, font, color: gray,
  });
  y -= 24;

  page.drawText(contractTitle, {
    x: M, y, size: 22, font: bold, color: black,
  });
  y -= 30;

  // Divider
  page.drawLine({
    start: { x: M, y }, end: { x: W - M, y },
    thickness: 1, color: light,
  });
  y -= 20;

  // ─── Clauses ────────────────────────────────────────────────────────────────

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    const resolvedText = replacePlaceholders(clause.text);

    // Title
    ensureSpace(30);
    const title = `§ ${i + 1} ${clause.title}`;
    page.drawText(title, { x: M, y, size: 12, font: bold, color: black });
    y -= 18;

    // Text — split by double newlines for paragraphs
    const paragraphs = resolvedText.split(/\n\n+/);
    for (const para of paragraphs) {
      // Handle single newlines as line breaks
      const lines = para.split(/\n/);
      for (const line of lines) {
        drawWrapped(line.trim(), 10, font, black);
      }
      y -= 6; // paragraph spacing
    }

    y -= 10; // clause spacing
  }

  // ─── Signature Block ────────────────────────────────────────────────────────

  ensureSpace(120);
  y -= 20;

  const now = new Date();
  page.drawText(
    `Ort, Datum: _________________________, den ${now.toLocaleDateString("de-DE")}`,
    { x: M, y, size: 10, font, color: black }
  );
  y -= 50;

  const sigW = (TW - 40) / 2;

  page.drawLine({
    start: { x: M, y }, end: { x: M + sigW, y },
    thickness: 0.5, color: black,
  });
  page.drawText("Partei A", {
    x: M, y: y - 14, size: 9, font, color: gray,
  });

  const rx = M + sigW + 40;
  page.drawLine({
    start: { x: rx, y }, end: { x: rx + sigW, y },
    thickness: 0.5, color: black,
  });
  page.drawText("Partei B", {
    x: rx, y: y - 14, size: 9, font, color: gray,
  });

  // Footer on last page
  drawFooter(page, pageNum);

  return pdfDoc.save();
}
