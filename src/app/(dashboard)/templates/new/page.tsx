"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required: boolean;
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { key: "vertragspartner", label: "Vertragspartner", type: "text", required: true },
  ]);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    setFields([
      ...fields,
      {
        key: `feld_${fields.length + 1}`,
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(
      fields.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, ...updates };
        // Auto-generate key from label
        if (updates.label !== undefined) {
          updated.key = updates.label
            .toLowerCase()
            .replace(/[^a-z0-9äöüß]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
        }
        return updated;
      })
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    if (fields.length === 0) {
      toast.error("Mindestens ein Feld erforderlich");
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      toast.error("Alle Felder brauchen ein Label");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, fields }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Fehler beim Erstellen");
        return;
      }

      toast.success("Vorlage erstellt!");
      router.push("/templates");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Neue Vorlage</h1>
        <p className="text-muted-foreground">
          Definiere Felder die pro Vertrag ausgefüllt werden.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorlage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder="z.B. Mietvertrag Standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              placeholder="Wofür wird die Vorlage verwendet?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Felder ({fields.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Feld hinzufügen
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Feldname</Label>
                  <Input
                    placeholder="z.B. Mieter Name"
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Typ</Label>
                  <Select
                    value={field.type}
                    onValueChange={(val) =>
                      updateField(index, { type: val as Field["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Zahl</SelectItem>
                      <SelectItem value="date">Datum</SelectItem>
                      <SelectItem value="textarea">Langtext</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-1.5 mt-6 text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                  className="rounded"
                />
                Pflicht
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="mt-5 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Felder. Klicke &quot;Feld hinzufügen&quot;.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Erstellt..." : "Vorlage erstellen"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Abbrechen
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
