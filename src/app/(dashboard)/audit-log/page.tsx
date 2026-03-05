import { getAuditLogs } from "@/lib/db/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ClipboardList } from "lucide-react";

const actionLabels: Record<string, string> = {
  "contract.created": "Vertrag erstellt",
  "contract.updated": "Vertrag bearbeitet",
  "contract.deleted": "Vertrag gelöscht",
  "contract.viewed": "Vertrag angesehen",
};

export default async function AuditLogPage() {
  const logs = await getAuditLogs(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">Alle Aktivitäten im System</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          Noch keine Aktivitäten vorhanden.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aktion</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Ressource</TableHead>
                <TableHead>Zeitpunkt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {actionLabels[log.action] ?? log.action}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.userName ?? log.userEmail ?? "Unbekannt"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {log.resourceId?.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), "dd.MM.yyyy HH:mm:ss", {
                      locale: de,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
