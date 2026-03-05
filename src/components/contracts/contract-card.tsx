import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExpiryBadge } from "./expiry-badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Contract } from "@/lib/db/schema";

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  active: { label: "Aktiv", variant: "default" as const },
  expiring_soon: { label: "Läuft bald ab", variant: "destructive" as const },
  expired: { label: "Abgelaufen", variant: "outline" as const },
};

export function ContractCard({ contract }: { contract: Contract }) {
  const status = statusConfig[contract.status];

  return (
    <Link href={`/contracts/${contract.id}`}>
      <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{contract.title}</p>
            <p className="text-sm text-muted-foreground">{contract.counterparty}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {contract.endDate && (
            <span className="flex items-center gap-1">
              Bis {format(new Date(contract.endDate), "dd.MM.yyyy", { locale: de })}
              <ExpiryBadge endDate={contract.endDate} />
            </span>
          )}
          {contract.value && (
            <span>
              {new Intl.NumberFormat("de-DE", { style: "currency", currency: contract.currency }).format(contract.value)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
