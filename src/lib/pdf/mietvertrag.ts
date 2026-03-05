import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateMietvertragPdf(
  values: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 60;
  const textWidth = pageWidth - margin * 2;
  const black = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.8, 0.8, 0.8);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function newPageIfNeeded(needed: number) {
    if (y < margin + needed) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  function drawTitle(text: string, size: number, yOffset: number = 0) {
    newPageIfNeeded(size + 20);
    y -= yOffset;
    page.drawText(text, { x: margin, y, size, font: bold, color: black });
    y -= size + 6;
  }

  function drawParagraph(text: string, size: number = 10) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > textWidth) {
        newPageIfNeeded(size + 4);
        page.drawText(line, { x: margin, y, size, font, color: black });
        y -= size + 4;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      newPageIfNeeded(size + 4);
      page.drawText(line, { x: margin, y, size, font, color: black });
      y -= size + 4;
    }
    y -= 6;
  }

  function drawDivider() {
    newPageIfNeeded(10);
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.5,
      color: lightGray,
    });
    y -= 14;
  }

  function val(key: string, fallback: string = "_______________") {
    return values[key]?.trim() || fallback;
  }

  // ─── Header ─────────────────────────────────────────────────────────────────

  page.drawText("MIETVERTRAG", {
    x: margin, y, size: 24, font: bold, color: black,
  });
  y -= 28;

  page.drawText("für gewerbliche Räume", {
    x: margin, y, size: 11, font: italic, color: gray,
  });
  y -= 30;

  drawDivider();

  // ─── Vertragsparteien ───────────────────────────────────────────────────────

  drawTitle("§ 1 Vertragsparteien", 12, 4);

  drawParagraph(
    `Zwischen ${val("vermieter_name")} (nachfolgend „Vermieter") und ${val("mieter_name")}, wohnhaft in ${val("mieter_adresse")} (nachfolgend „Mieter"), wird folgender Mietvertrag geschlossen:`
  );

  // ─── Mietgegenstand ────────────────────────────────────────────────────────

  drawTitle("§ 2 Mietgegenstand", 12, 8);

  drawParagraph(
    `Der Vermieter vermietet dem Mieter die nachfolgend bezeichneten Räumlichkeiten in ${val("objekt_adresse")} mit einer Gesamtfläche von ca. ${val("flaeche", "___")} m² zur gewerblichen Nutzung.`
  );

  drawParagraph(
    "Die Räumlichkeiten werden dem Mieter in ihrem derzeitigen Zustand übergeben. Ein Übergabeprotokoll wird bei Mietbeginn erstellt und als Anlage beigefügt."
  );

  // ─── Mietdauer ─────────────────────────────────────────────────────────────

  drawTitle("§ 3 Mietdauer", 12, 8);

  const endeText = val("vertragsende", "")
    ? `Das Mietverhältnis beginnt am ${val("vertragsbeginn")} und ist befristet bis zum ${val("vertragsende")}. Es verlängert sich automatisch um jeweils 12 Monate, sofern es nicht mit einer Frist von ${val("kuendigungsfrist", "3 Monaten")} zum Vertragsende gekündigt wird.`
    : `Das Mietverhältnis beginnt am ${val("vertragsbeginn")} und wird auf unbestimmte Zeit geschlossen. Es kann von beiden Seiten mit einer Frist von ${val("kuendigungsfrist", "3 Monaten")} zum Monatsende gekündigt werden.`;

  drawParagraph(endeText);

  // ─── Miete ─────────────────────────────────────────────────────────────────

  drawTitle("§ 4 Miete und Nebenkosten", 12, 8);

  drawParagraph(
    `Die monatliche Nettomiete beträgt ${val("miete_monatlich", "___")} EUR (in Worten: ${numberToWords(val("miete_monatlich", "0"))} Euro). Die Miete ist jeweils im Voraus bis zum 3. Werktag eines Monats auf das vom Vermieter benannte Konto zu überweisen.`
  );

  const nk = val("nebenkosten", "");
  if (nk && nk !== "_______________") {
    drawParagraph(
      `Zusätzlich zur Nettomiete zahlt der Mieter eine monatliche Nebenkostenvorauszahlung in Höhe von ${nk} EUR. Die Abrechnung der Nebenkosten erfolgt jährlich. Nachzahlungen sind innerhalb von 30 Tagen nach Zugang der Abrechnung fällig.`
    );
  } else {
    drawParagraph(
      "Die Nebenkosten werden gesondert nach tatsächlichem Verbrauch abgerechnet. Eine monatliche Vorauszahlung wird bei Vertragsbeginn vereinbart."
    );
  }

  // ─── Kaution ───────────────────────────────────────────────────────────────

  drawTitle("§ 5 Kaution", 12, 8);

  drawParagraph(
    `Der Mieter hinterlegt bei Vertragsbeginn eine Mietkaution in Höhe von drei Nettokaltmieten (${parseFloat(val("miete_monatlich", "0")) ? (parseFloat(val("miete_monatlich", "0")) * 3).toLocaleString("de-DE") : "___"} EUR). Die Kaution wird auf einem separaten Kautionskonto angelegt und nach Beendigung des Mietverhältnisses unter Abzug etwaiger Forderungen zurückgezahlt.`
  );

  // ─── Nutzung ───────────────────────────────────────────────────────────────

  drawTitle("§ 6 Nutzung der Mietsache", 12, 8);

  drawParagraph(
    "Die Räumlichkeiten dürfen ausschließlich zu dem bei Vertragsabschluss vereinbarten gewerblichen Zweck genutzt werden. Eine Untervermietung oder anderweitige Gebrauchsüberlassung bedarf der vorherigen schriftlichen Zustimmung des Vermieters."
  );

  // ─── Instandhaltung ───────────────────────────────────────────────────────

  drawTitle("§ 7 Instandhaltung und Schönheitsreparaturen", 12, 8);

  drawParagraph(
    "Der Vermieter ist für die Instandhaltung der baulichen Substanz, des Daches, der Fassade sowie der tragenden Wände verantwortlich. Der Mieter übernimmt die Schönheitsreparaturen innerhalb der Mieträume sowie die Instandhaltung der von ihm eingebrachten Einrichtungen."
  );

  // ─── Sondervereinbarungen ─────────────────────────────────────────────────

  const sonder = val("sondervereinbarungen", "");
  if (sonder && sonder !== "_______________") {
    drawTitle("§ 8 Sondervereinbarungen", 12, 8);
    drawParagraph(sonder);
  }

  // ─── Schlussbestimmungen ──────────────────────────────────────────────────

  drawTitle(sonder && sonder !== "_______________" ? "§ 9 Schlussbestimmungen" : "§ 8 Schlussbestimmungen", 12, 8);

  drawParagraph(
    "Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Sollte eine Bestimmung dieses Vertrages unwirksam sein oder werden, so bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Gerichtsstand ist der Sitz des Mietobjekts."
  );

  // ─── Unterschriften ───────────────────────────────────────────────────────

  y -= 30;
  newPageIfNeeded(100);

  const now = new Date();
  page.drawText(
    `Ort, Datum: _________________________, den ${now.toLocaleDateString("de-DE")}`,
    { x: margin, y, size: 10, font, color: black }
  );
  y -= 50;

  const sigWidth = (textWidth - 40) / 2;

  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + sigWidth, y },
    thickness: 0.5, color: black,
  });
  page.drawText("Vermieter", {
    x: margin, y: y - 14, size: 9, font, color: gray,
  });
  page.drawText(val("vermieter_name", ""), {
    x: margin, y: y - 26, size: 8, font: italic, color: gray,
  });

  const rightX = margin + sigWidth + 40;
  page.drawLine({
    start: { x: rightX, y },
    end: { x: rightX + sigWidth, y },
    thickness: 0.5, color: black,
  });
  page.drawText("Mieter", {
    x: rightX, y: y - 14, size: 9, font, color: gray,
  });
  page.drawText(val("mieter_name", ""), {
    x: rightX, y: y - 26, size: 8, font: italic, color: gray,
  });

  // ─── Footer ───────────────────────────────────────────────────────────────

  y -= 50;
  page.drawText("Seite 1 · Contract Manager · Vertraulich", {
    x: margin, y: margin - 20, size: 7, font, color: lightGray,
  });

  return pdfDoc.save();
}

function numberToWords(numStr: string): string {
  const n = parseInt(numStr);
  if (isNaN(n)) return numStr;
  // Simple German number words for common amounts
  const units = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
  if (n < 10) return units[n] || String(n);
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    return `${numberToWords(String(thousands))}tausend${rest ? numberToWords(String(rest)) : ""}`;
  }
  return String(n);
}
