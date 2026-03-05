"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function ContractSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/contracts?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Vertrag oder Partner suchen..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const timeout = setTimeout(
              () => updateParam("search", e.target.value),
              300
            );
            return () => clearTimeout(timeout);
          }}
        />
      </div>
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(val) => updateParam("status", val)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status filtern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="draft">Entwurf</SelectItem>
          <SelectItem value="active">Aktiv</SelectItem>
          <SelectItem value="expiring_soon">Läuft bald ab</SelectItem>
          <SelectItem value="expired">Abgelaufen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
