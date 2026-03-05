import { auth } from "@/auth";
import { getDashboardStats, getContracts, getAuditLogs } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Archive,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  active: { label: "Aktiv", variant: "default" as const },
  expiring_soon: { label: "Läuft bald ab", variant: "destructive" as const },
  expired: { label: "Abgelaufen", variant: "outline" as const },
};

export default async function DashboardPage() {
  const session = await auth();
  const [stats, recentContracts, auditLogs] = await Promise.all([
    getDashboardStats(),
    getContracts(),
    getAuditLogs(5),
  ]);

  const recent = recentContracts.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Willkommen, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">Deine Vertragsübersicht</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Alle Verträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-muted-foreground mt-1">Laufende Verträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Läuft bald ab</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{stats.expiring}</p>
            <p className="text-xs text-muted-foreground mt-1">Handlungsbedarf</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entwürfe</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.draft}</p>
            <p className="text-xs text-muted-foreground mt-1">Nicht finalisiert</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neueste Verträge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Verträge.{" "}
                <Link href="/contracts/new" className="underline">
                  Ersten Vertrag anlegen
                </Link>
              </p>
            ) : (
              recent.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{contract.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {contract.counterparty}
                    </p>
                  </div>
                  <Badge variant={statusConfig[contract.status].variant}>
                    {statusConfig[contract.status].label}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Aktivitäten.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.userName ?? "Unbekannt"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.createdAt), "dd.MM. HH:mm", {
                      locale: de,
                    })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
