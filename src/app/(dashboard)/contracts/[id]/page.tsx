import { getContractById, getDocumentsByContract } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Pencil, FileDown, ExternalLink } from "lucide-react";
import { DeleteContractButton } from "@/components/contracts/delete-contract-button";
import { GenerateDocument } from "@/components/contracts/generate-document";
import { ExpiryBanner } from "@/components/contracts/expiry-banner";

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  active: { label: "Aktiv", variant: "default" as const },
  expiring_soon: { label: "Läuft bald ab", variant: "destructive" as const },
  expired: { label: "Abgelaufen", variant: "outline" as const },
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();
  const documents = await getDocumentsByContract(id);

  const status = statusConfig[contract.status];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/contracts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-muted-foreground">{contract.counterparty}</p>
        </div>
        <div className="flex gap-2">
          <GenerateDocument contractId={id} />
          <Link href={`/contracts/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </Link>
          <DeleteContractButton id={id} title={contract.title} />
        </div>
      </div>

      <ExpiryBanner endDate={contract.endDate?.toISOString() ?? null} />

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vertragspartner</p>
              <p className="mt-1">{contract.counterparty}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
            {contract.startDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Startdatum</p>
                <p className="mt-1">
                  {format(new Date(contract.startDate), "dd. MMMM yyyy", { locale: de })}
                </p>
              </div>
            )}
            {contract.endDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enddatum</p>
                <p className="mt-1">
                  {format(new Date(contract.endDate), "dd. MMMM yyyy", { locale: de })}
                </p>
              </div>
            )}
            {contract.value && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vertragswert</p>
                <p className="mt-1 font-medium">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: contract.currency,
                  }).format(contract.value)}
                </p>
              </div>
            )}
          </div>

          {contract.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Notizen</p>
                <p className="text-sm whitespace-pre-wrap">{contract.notes}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="flex gap-8 text-xs text-muted-foreground">
            <span>
              Erstellt:{" "}
              {format(new Date(contract.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}
            </span>
            <span>
              Aktualisiert:{" "}
              {format(new Date(contract.updatedAt), "dd.MM.yyyy HH:mm", { locale: de })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileDown className="h-4 w-4 text-muted-foreground" />
            Generierte Dokumente ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Dokumente. Klicke &quot;PDF erstellen&quot; um ein Dokument aus einer Vorlage zu generieren.
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Vorlage: {doc.templateName ?? "Unbekannt"} ·{" "}
                      {format(new Date(doc.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}
                    </p>
                  </div>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
