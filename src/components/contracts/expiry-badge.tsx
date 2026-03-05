import { Badge } from "@/components/ui/badge";

export function ExpiryBadge({ endDate }: { endDate: Date | null }) {
  if (!endDate) return null;

  const days = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Abgelaufen
      </Badge>
    );
  }

  if (days <= 30) {
    return (
      <Badge variant="destructive" className="text-xs">
        {days}d
      </Badge>
    );
  }

  if (days <= 90) {
    return (
      <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30">
        {days}d
      </Badge>
    );
  }

  return null;
}
