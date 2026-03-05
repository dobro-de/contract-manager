import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getContracts, createAuditLog } from "@/lib/db/queries";

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  expiring_soon: "Läuft bald ab",
  expired: "Abgelaufen",
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contracts = await getContracts();

  // BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const header = "Titel;Vertragspartner;Status;Startdatum;Enddatum;Wert (EUR);Notizen";
  const rows = contracts.map((c) => {
    const startDate = c.startDate
      ? new Date(c.startDate).toLocaleDateString("de-DE")
      : "";
    const endDate = c.endDate
      ? new Date(c.endDate).toLocaleDateString("de-DE")
      : "";
    const value = c.value ? String(c.value) : "";
    const notes = (c.notes ?? "").replace(/;/g, ",").replace(/\n/g, " ");
    const status = statusLabels[c.status] ?? c.status;

    return `${c.title};${c.counterparty};${status};${startDate};${endDate};${value};${notes}`;
  });

  const csv = BOM + header + "\n" + rows.join("\n");

  await createAuditLog(session.user.id, "contracts.exported", undefined, "contract", {
    count: contracts.length,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vertraege_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
