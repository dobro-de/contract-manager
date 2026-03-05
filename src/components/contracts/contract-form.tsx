"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createContractSchema, type CreateContractInput } from "@/lib/validations/contract";
import type { Contract } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  contract?: Contract;
  mode: "create" | "edit";
};

export function ContractForm({ contract, mode }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
    defaultValues: contract
      ? {
          title: contract.title,
          counterparty: contract.counterparty,
          status: contract.status,
          startDate: contract.startDate?.toISOString() ?? undefined,
          endDate: contract.endDate?.toISOString() ?? undefined,
          value: contract.value ?? undefined,
          notes: contract.notes ?? undefined,
        }
      : { status: "draft", currency: "EUR" },
  });

  const status = watch("status");

  const onSubmit = async (data: CreateContractInput) => {
    const url =
      mode === "edit" ? `/api/contracts/${contract!.id}` : "/api/contracts";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Fehler beim Speichern");
      return;
    }

    const saved = await res.json();
    toast.success(mode === "edit" ? "Vertrag gespeichert" : "Vertrag erstellt");
    router.push(`/contracts/${saved.id}`);
    router.refresh();
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Vertrag bearbeiten" : "Neuer Vertrag"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Titel */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" placeholder="z.B. Mietvertrag Büro Hamburg" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Vertragspartner */}
          <div className="space-y-2">
            <Label htmlFor="counterparty">Vertragspartner *</Label>
            <Input id="counterparty" placeholder="z.B. Immobilien GmbH" {...register("counterparty")} />
            {errors.counterparty && (
              <p className="text-sm text-destructive">{errors.counterparty.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setValue("status", val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="expiring_soon">Läuft bald ab</SelectItem>
                <SelectItem value="expired">Abgelaufen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datum */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          {/* Vertragswert */}
          <div className="space-y-2">
            <Label htmlFor="value">Vertragswert (€)</Label>
            <Input
              id="value"
              type="number"
              placeholder="z.B. 12000"
              {...register("value", { valueAsNumber: true })}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Interne Notizen zum Vertrag..."
              rows={4}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Speichert..." : mode === "edit" ? "Speichern" : "Erstellen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Abbrechen
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
