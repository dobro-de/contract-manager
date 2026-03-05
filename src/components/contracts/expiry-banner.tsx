"use client";

import { AlertTriangle, Clock } from "lucide-react";

export function ExpiryBanner({ endDate }: { endDate: string | null }) {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Dieser Vertrag ist seit {Math.abs(days)} Tagen abgelaufen.</span>
      </div>
    );
  }

  if (days <= 30) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Läuft in <strong>{days} Tagen</strong> ab. Verlängerung prüfen!</span>
      </div>
    );
  }

  if (days <= 90) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Läuft in {days} Tagen ab ({end.toLocaleDateString("de-DE")})</span>
      </div>
    );
  }

  return null;
}
