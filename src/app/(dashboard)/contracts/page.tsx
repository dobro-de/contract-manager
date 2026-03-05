import { getContracts } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ContractSearch } from "@/components/contracts/contract-search";
import { DeleteContractButton } from "@/components/contracts/delete-contract-button";

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  active: { label: "Aktiv", variant: "default" as const },
  expiring_soon: { label: "Läuft bald ab", variant: "destructive" as const },
  expired: { label: "Abgelaufen", variant: "outline" as const },
};

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const contracts = await getContracts({
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verträge</h1>
          <p className="text-muted-foreground">{contracts.length} Verträge</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/contracts/export">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
          </a>
          <Link href="/contracts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Vertrag
            </Button>
          </Link>
        </div>
      </div>

      <ContractSearch />

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Keine Verträge gefunden</h2>
          <p className="text-muted-foreground mb-4">
            {params.search || params.status
              ? "Keine Ergebnisse für diese Filter."
              : "Leg deinen ersten Vertrag an."}
          </p>
          {!params.search && !params.status && (
            <Link href="/contracts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Vertrag anlegen
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Vertragspartner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Laufzeit</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="font-medium hover:underline"
                    >
                      {contract.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contract.counterparty}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[contract.status].variant}>
                      {statusConfig[contract.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contract.endDate
                      ? format(new Date(contract.endDate), "dd.MM.yyyy", {
                          locale: de,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(contract.createdAt), "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </TableCell>
                  <TableCell>
                    <DeleteContractButton id={contract.id} title={contract.title} />
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
