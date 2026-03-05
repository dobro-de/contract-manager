import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "demo@contract-manager.app"))
    .limit(1);

  if (!admin) {
    console.log("No admin found");
    return;
  }

  // Delete old documents + templates
  await db.delete(schema.documents);
  await db.delete(schema.templates);
  console.log("Old templates + documents deleted");

  // ═══════════════════════════════════════════════════════════════════════════
  // MIETVERTRAG
  // ═══════════════════════════════════════════════════════════════════════════

  await db.insert(schema.templates).values({
    name: "Mietvertrag Gewerbe",
    description: "Standardvorlage für gewerbliche Mietverträge mit allen relevanten Klauseln",
    fields: JSON.stringify([
      { key: "vermieter_name", label: "Vermieter (Name/Firma)", type: "text", required: true },
      { key: "vermieter_adresse", label: "Vermieter (Adresse)", type: "text", required: true },
      { key: "mieter_name", label: "Mieter (Name/Firma)", type: "text", required: true },
      { key: "mieter_adresse", label: "Mieter (Adresse)", type: "text", required: true },
      { key: "objekt_adresse", label: "Objekt-Adresse", type: "text", required: true },
      { key: "flaeche", label: "Fläche (m²)", type: "number", required: true },
      { key: "nutzungszweck", label: "Nutzungszweck", type: "text", required: true },
      { key: "miete_netto", label: "Nettomiete monatlich (€)", type: "number", required: true },
      { key: "nebenkosten", label: "Nebenkostenvorauszahlung (€)", type: "number", required: false },
      { key: "kaution_monate", label: "Kaution (Monatsmieten)", type: "number", required: true },
      { key: "vertragsbeginn", label: "Vertragsbeginn", type: "date", required: true },
      { key: "vertragsende", label: "Vertragsende (leer = unbefristet)", type: "date", required: false },
      { key: "kuendigungsfrist", label: "Kündigungsfrist", type: "text", required: true },
      { key: "sondervereinbarungen", label: "Sondervereinbarungen", type: "textarea", required: false },
    ]),
    clauses: JSON.stringify([
      {
        title: "Vertragsparteien",
        text: "Zwischen {{vermieter_name}}, {{vermieter_adresse}} (nachfolgend \"Vermieter\") und {{mieter_name}}, {{mieter_adresse}} (nachfolgend \"Mieter\"), wird folgender Mietvertrag geschlossen.",
      },
      {
        title: "Mietgegenstand",
        text: "Der Vermieter vermietet dem Mieter die Räumlichkeiten in {{objekt_adresse}} mit einer Gesamtfläche von ca. {{flaeche}} m² zum Zwecke der Nutzung als {{nutzungszweck}}.\n\nDie Räumlichkeiten werden dem Mieter in ihrem derzeitigen Zustand übergeben. Ein Übergabeprotokoll wird bei Mietbeginn erstellt und dem Vertrag als Anlage beigefügt. Mitvermietet sind die in der Anlage aufgeführten Einrichtungsgegenstände und Ausstattungsmerkmale.",
      },
      {
        title: "Mietdauer und Kündigung",
        text: "Das Mietverhältnis beginnt am {{vertragsbeginn}}. Es kann von beiden Seiten mit einer Frist von {{kuendigungsfrist}} zum Monatsende gekündigt werden. Die Kündigung bedarf der Schriftform.\n\nDas Recht zur fristlosen Kündigung aus wichtigem Grund bleibt für beide Parteien unberührt. Ein wichtiger Grund liegt insbesondere vor bei Zahlungsverzug von mehr als zwei Monatsmieten oder bei vertragswidriger Nutzung trotz Abmahnung.",
      },
      {
        title: "Miete und Nebenkosten",
        text: "Die monatliche Nettomiete beträgt {{miete_netto}} EUR. Zusätzlich zahlt der Mieter eine monatliche Nebenkostenvorauszahlung in Höhe von {{nebenkosten}} EUR. Die gesetzliche Umsatzsteuer wird zusätzlich berechnet, sofern der Vermieter zur Umsatzsteuer optiert.\n\nDie Miete ist monatlich im Voraus, spätestens bis zum 3. Werktag eines jeden Monats, auf das vom Vermieter benannte Konto zu überweisen. Bei Zahlungsverzug ist der Vermieter berechtigt, Verzugszinsen in gesetzlicher Höhe zu berechnen.\n\nDie Nebenkostenabrechnung erfolgt jährlich. Nachzahlungen sind innerhalb von 30 Tagen nach Zugang der Abrechnung fällig. Guthaben werden mit der nächsten Mietzahlung verrechnet.",
      },
      {
        title: "Kaution",
        text: "Der Mieter hinterlegt bei Vertragsbeginn eine Mietkaution in Höhe von {{kaution_monate}} Nettokaltmieten. Die Kaution ist vor Übergabe der Mietsache auf das Kautionskonto des Vermieters zu zahlen.\n\nDie Kaution wird nach Beendigung des Mietverhältnisses und ordnungsgemäßer Rückgabe der Mietsache unter Abzug etwaiger berechtigter Forderungen des Vermieters zurückgezahlt. Die Rückzahlung erfolgt innerhalb von sechs Monaten nach Vertragsende.",
      },
      {
        title: "Nutzung und Untervermietung",
        text: "Die Räumlichkeiten dürfen ausschließlich zum vereinbarten Zweck ({{nutzungszweck}}) genutzt werden. Eine Änderung des Nutzungszwecks bedarf der vorherigen schriftlichen Zustimmung des Vermieters.\n\nEine Untervermietung oder sonstige Gebrauchsüberlassung an Dritte ist nur mit vorheriger schriftlicher Genehmigung des Vermieters zulässig. Der Vermieter darf die Zustimmung nur aus wichtigem Grund verweigern.",
      },
      {
        title: "Instandhaltung und Reparaturen",
        text: "Der Vermieter ist verantwortlich für die Instandhaltung der Gebäudesubstanz, des Daches, der Fassade, der tragenden Wände sowie der zentralen Versorgungsleitungen.\n\nDer Mieter übernimmt die Schönheitsreparaturen innerhalb der Mieträume sowie die Instandhaltung der von ihm eingebrachten Einrichtungen. Beschädigungen, die über die normale Abnutzung hinausgehen, sind vom Mieter auf eigene Kosten zu beseitigen.",
      },
      {
        title: "Betretungsrecht",
        text: "Der Vermieter oder seine Beauftragten sind berechtigt, die Mieträume nach vorheriger Ankündigung (mindestens 24 Stunden) zu angemessenen Zeiten zu betreten, soweit dies zur Instandhaltung, zur Besichtigung durch Kauf- oder Mietinteressenten oder zur Überprüfung des vertragsgemäßen Gebrauchs erforderlich ist.\n\nBei Gefahr im Verzug entfällt die Ankündigungspflicht.",
      },
      {
        title: "Haftung und Versicherung",
        text: "Der Mieter haftet für alle Schäden, die durch ihn, seine Mitarbeiter, Kunden oder von ihm beauftragte Dritte an der Mietsache verursacht werden.\n\nDer Mieter ist verpflichtet, eine Betriebshaftpflichtversicherung mit angemessener Deckungssumme abzuschließen und auf Verlangen dem Vermieter nachzuweisen.",
      },
      {
        title: "Rückgabe der Mietsache",
        text: "Bei Beendigung des Mietverhältnisses hat der Mieter die Räumlichkeiten in ordnungsgemäßem Zustand, besenrein und frei von eigenen Einrichtungsgegenständen zurückzugeben. Die Rückgabe erfolgt durch gemeinsame Begehung und Erstellung eines Rückgabeprotokolls.\n\nVom Mieter vorgenommene bauliche Veränderungen sind auf Verlangen des Vermieters auf Kosten des Mieters zurückzubauen.",
      },
      {
        title: "Schlussbestimmungen",
        text: "Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für die Aufhebung des Schriftformerfordernisses.\n\nSollte eine Bestimmung dieses Vertrages unwirksam sein oder werden, so bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.\n\nGerichtsstand für alle Streitigkeiten aus diesem Vertrag ist der Sitz des Mietobjekts.",
      },
    ]),
    createdById: admin.id,
  });

  console.log("✅ Mietvertrag Gewerbe erstellt");

  // ═══════════════════════════════════════════════════════════════════════════
  // DIENSTLEISTUNGSVERTRAG
  // ═══════════════════════════════════════════════════════════════════════════

  await db.insert(schema.templates).values({
    name: "Dienstleistungsvertrag",
    description: "Für Freelancer, Berater und externe Dienstleister",
    fields: JSON.stringify([
      { key: "auftraggeber_name", label: "Auftraggeber (Name/Firma)", type: "text", required: true },
      { key: "auftraggeber_adresse", label: "Auftraggeber (Adresse)", type: "text", required: true },
      { key: "auftragnehmer_name", label: "Auftragnehmer (Name/Firma)", type: "text", required: true },
      { key: "auftragnehmer_adresse", label: "Auftragnehmer (Adresse)", type: "text", required: true },
      { key: "leistung", label: "Leistungsbeschreibung", type: "textarea", required: true },
      { key: "verguetung", label: "Vergütung (€)", type: "number", required: true },
      { key: "zahlungsart", label: "Zahlungsart (pauschal/Stundensatz/monatlich)", type: "text", required: true },
      { key: "zahlungsziel", label: "Zahlungsziel (Tage)", type: "number", required: true },
      { key: "laufzeit_von", label: "Laufzeit von", type: "date", required: true },
      { key: "laufzeit_bis", label: "Laufzeit bis", type: "date", required: false },
      { key: "kuendigungsfrist", label: "Kündigungsfrist", type: "text", required: true },
      { key: "gerichtsstand", label: "Gerichtsstand", type: "text", required: false },
      { key: "besondere_vereinbarungen", label: "Besondere Vereinbarungen", type: "textarea", required: false },
    ]),
    clauses: JSON.stringify([
      {
        title: "Vertragsparteien",
        text: "Zwischen {{auftraggeber_name}}, {{auftraggeber_adresse}} (nachfolgend \"Auftraggeber\") und {{auftragnehmer_name}}, {{auftragnehmer_adresse}} (nachfolgend \"Auftragnehmer\"), wird folgender Dienstleistungsvertrag geschlossen.",
      },
      {
        title: "Vertragsgegenstand",
        text: "Der Auftragnehmer erbringt für den Auftraggeber folgende Leistungen:\n\n{{leistung}}\n\nDer Auftragnehmer erbringt die Leistungen selbstständig und eigenverantwortlich. Er unterliegt keinen Weisungen hinsichtlich Ort, Zeit und Art der Durchführung der Leistung, soweit dies nicht zur ordnungsgemäßen Vertragserfüllung erforderlich ist.",
      },
      {
        title: "Vertragsdauer",
        text: "Das Vertragsverhältnis beginnt am {{laufzeit_von}} und kann von beiden Seiten mit einer Frist von {{kuendigungsfrist}} gekündigt werden. Die Kündigung bedarf der Schriftform.\n\nDas Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor, wenn eine Partei wesentliche Vertragspflichten trotz schriftlicher Abmahnung wiederholt verletzt.",
      },
      {
        title: "Vergütung und Zahlung",
        text: "Die Vergütung beträgt {{verguetung}} EUR ({{zahlungsart}}). Die gesetzliche Umsatzsteuer wird, soweit anfallend, gesondert ausgewiesen.\n\nRechnungen sind innerhalb von {{zahlungsziel}} Tagen nach Zugang ohne Abzug zu begleichen. Bei Zahlungsverzug gelten die gesetzlichen Verzugsregelungen.\n\nReisekosten und sonstige Auslagen werden nur nach vorheriger schriftlicher Vereinbarung erstattet.",
      },
      {
        title: "Mitwirkungspflichten des Auftraggebers",
        text: "Der Auftraggeber stellt dem Auftragnehmer alle zur Leistungserbringung erforderlichen Informationen, Unterlagen und Zugänge rechtzeitig zur Verfügung. Verzögerungen, die auf fehlende Mitwirkung des Auftraggebers zurückzuführen sind, gehen nicht zu Lasten des Auftragnehmers.\n\nDer Auftraggeber benennt einen Ansprechpartner, der für die Abstimmung und Abnahme der Leistungen zuständig ist.",
      },
      {
        title: "Gewährleistung und Haftung",
        text: "Der Auftragnehmer haftet für die fachgerechte und sorgfältige Erbringung der vereinbarten Leistungen. Mängelansprüche sind innerhalb von 14 Tagen nach Leistungserbringung schriftlich geltend zu machen.\n\nDie Haftung des Auftragnehmers ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, es sei denn, es handelt sich um die Verletzung wesentlicher Vertragspflichten. In diesem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.",
      },
      {
        title: "Vertraulichkeit",
        text: "Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erhaltenen vertraulichen Informationen streng vertraulich zu behandeln und nur für die Zwecke dieses Vertrages zu verwenden.\n\nDiese Verpflichtung besteht auch nach Beendigung des Vertragsverhältnisses für einen Zeitraum von zwei Jahren fort. Ausgenommen sind Informationen, die öffentlich bekannt sind oder ohne Verschulden der empfangenden Partei öffentlich bekannt werden.",
      },
      {
        title: "Nutzungsrechte und geistiges Eigentum",
        text: "Alle im Rahmen dieses Vertrages erstellten Arbeitsergebnisse gehen mit vollständiger Bezahlung in das uneingeschränkte Nutzungsrecht des Auftraggebers über.\n\nDer Auftragnehmer behält das Recht, die erbrachten Leistungen in anonymisierter Form als Referenz zu verwenden, sofern der Auftraggeber dem nicht ausdrücklich widerspricht.",
      },
      {
        title: "Schlussbestimmungen",
        text: "Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Mündliche Nebenabreden bestehen nicht.\n\nSollte eine Bestimmung dieses Vertrages unwirksam sein oder werden, wird die Wirksamkeit der übrigen Bestimmungen hiervon nicht berührt.\n\nEs gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist {{gerichtsstand}}.",
      },
    ]),
    createdById: admin.id,
  });

  console.log("✅ Dienstleistungsvertrag erstellt");

  // ═══════════════════════════════════════════════════════════════════════════
  // ARBEITSVERTRAG
  // ═══════════════════════════════════════════════════════════════════════════

  await db.insert(schema.templates).values({
    name: "Arbeitsvertrag",
    description: "Standardvorlage für Arbeitsverträge nach deutschem Arbeitsrecht",
    fields: JSON.stringify([
      { key: "arbeitgeber_name", label: "Arbeitgeber (Firma)", type: "text", required: true },
      { key: "arbeitgeber_adresse", label: "Arbeitgeber (Adresse)", type: "text", required: true },
      { key: "arbeitnehmer_name", label: "Arbeitnehmer (Name)", type: "text", required: true },
      { key: "arbeitnehmer_adresse", label: "Arbeitnehmer (Adresse)", type: "text", required: true },
      { key: "position", label: "Position / Stellenbezeichnung", type: "text", required: true },
      { key: "taetigkeiten", label: "Tätigkeitsbeschreibung", type: "textarea", required: true },
      { key: "gehalt_brutto", label: "Monatsgehalt brutto (€)", type: "number", required: true },
      { key: "wochenstunden", label: "Wochenarbeitszeit (Std.)", type: "number", required: true },
      { key: "urlaubstage", label: "Urlaubstage pro Jahr", type: "number", required: true },
      { key: "arbeitsbeginn", label: "Arbeitsbeginn", type: "date", required: true },
      { key: "probezeit_monate", label: "Probezeit (Monate)", type: "number", required: true },
      { key: "arbeitsort", label: "Arbeitsort", type: "text", required: true },
      { key: "remote_regelung", label: "Remote/Homeoffice-Regelung", type: "textarea", required: false },
      { key: "sonstige_vereinbarungen", label: "Sonstige Vereinbarungen", type: "textarea", required: false },
    ]),
    clauses: JSON.stringify([
      {
        title: "Vertragsparteien",
        text: "Zwischen {{arbeitgeber_name}}, {{arbeitgeber_adresse}} (nachfolgend \"Arbeitgeber\") und {{arbeitnehmer_name}}, {{arbeitnehmer_adresse}} (nachfolgend \"Arbeitnehmer\"), wird folgender Arbeitsvertrag geschlossen.",
      },
      {
        title: "Tätigkeit und Aufgabenbereich",
        text: "Der Arbeitnehmer wird als {{position}} eingestellt. Zu seinen Aufgaben gehören insbesondere:\n\n{{taetigkeiten}}\n\nDer Arbeitgeber behält sich vor, dem Arbeitnehmer im Rahmen des Direktionsrechts andere zumutbare Aufgaben zuzuweisen, die seinen Fähigkeiten und seiner Qualifikation entsprechen.",
      },
      {
        title: "Beginn und Probezeit",
        text: "Das Arbeitsverhältnis beginnt am {{arbeitsbeginn}} und wird auf unbestimmte Zeit geschlossen.\n\nDie ersten {{probezeit_monate}} Monate gelten als Probezeit. Während der Probezeit kann das Arbeitsverhältnis von beiden Seiten mit einer Frist von zwei Wochen zum Monatsende gekündigt werden.",
      },
      {
        title: "Arbeitszeit und Arbeitsort",
        text: "Die regelmäßige wöchentliche Arbeitszeit beträgt {{wochenstunden}} Stunden. Die Verteilung der Arbeitszeit richtet sich nach den betrieblichen Erfordernissen und wird zwischen Arbeitgeber und Arbeitnehmer abgestimmt.\n\nDer Arbeitsort ist {{arbeitsort}}. Die Regelungen des Arbeitszeitgesetzes (ArbZG) werden eingehalten.",
      },
      {
        title: "Vergütung",
        text: "Der Arbeitnehmer erhält ein monatliches Bruttogehalt von {{gehalt_brutto}} EUR. Die Auszahlung erfolgt bargeldlos jeweils zum Monatsende auf das vom Arbeitnehmer benannte Konto.\n\nMit der Vergütung sind etwaige Überstunden bis zu 10% der regulären Arbeitszeit pro Monat abgegolten. Darüber hinausgehende Überstunden werden auf Basis des vereinbarten Stundensatzes vergütet oder durch Freizeitausgleich abgegolten.",
      },
      {
        title: "Urlaub",
        text: "Der Arbeitnehmer hat Anspruch auf {{urlaubstage}} Arbeitstage bezahlten Erholungsurlaub pro Kalenderjahr. Bei unterjährigem Ein- oder Austritt wird der Urlaubsanspruch anteilig berechnet.\n\nDer Urlaub ist rechtzeitig unter Berücksichtigung der betrieblichen Belange zu beantragen. Nicht genommener Urlaub verfällt grundsätzlich am 31. März des Folgejahres, sofern er nicht aus betrieblichen oder persönlichen Gründen übertragen wurde.",
      },
      {
        title: "Krankheit und Arbeitsunfähigkeit",
        text: "Im Falle einer krankheitsbedingten Arbeitsunfähigkeit ist der Arbeitgeber unverzüglich zu informieren. Eine ärztliche Arbeitsunfähigkeitsbescheinigung ist spätestens ab dem dritten Kalendertag der Erkrankung vorzulegen.\n\nDie Entgeltfortzahlung im Krankheitsfall richtet sich nach den gesetzlichen Bestimmungen (EntgFG).",
      },
      {
        title: "Verschwiegenheitspflicht",
        text: "Der Arbeitnehmer verpflichtet sich, über alle betrieblichen Angelegenheiten, insbesondere Geschäfts- und Betriebsgeheimnisse, Stillschweigen zu bewahren. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort.\n\nVerstöße gegen die Verschwiegenheitspflicht können arbeitsrechtliche Konsequenzen bis hin zur fristlosen Kündigung sowie Schadensersatzansprüche nach sich ziehen.",
      },
      {
        title: "Nebentätigkeit",
        text: "Jede entgeltliche Nebentätigkeit bedarf der vorherigen schriftlichen Zustimmung des Arbeitgebers. Die Zustimmung darf nur aus berechtigten betrieblichen Gründen verweigert werden.\n\nEhrenamtliche Tätigkeiten sind dem Arbeitgeber anzuzeigen, soweit sie die Arbeitsleistung beeinflussen können.",
      },
      {
        title: "Kündigung",
        text: "Nach Ablauf der Probezeit kann das Arbeitsverhältnis von beiden Seiten unter Einhaltung der gesetzlichen Kündigungsfristen gemäß § 622 BGB gekündigt werden. Die Kündigung bedarf der Schriftform.\n\nDas Recht zur fristlosen Kündigung aus wichtigem Grund gemäß § 626 BGB bleibt unberührt.",
      },
      {
        title: "Schlussbestimmungen",
        text: "Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Mündliche Nebenabreden bestehen nicht.\n\nSollte eine Bestimmung dieses Vertrages unwirksam sein oder werden, wird die Wirksamkeit der übrigen Bestimmungen hiervon nicht berührt.\n\nEs gilt das Recht der Bundesrepublik Deutschland.",
      },
    ]),
    createdById: admin.id,
  });

  console.log("✅ Arbeitsvertrag erstellt");
  console.log("\n🎉 Alle 3 Templates mit Klauseln angelegt!");
}

seed().catch(console.error);
