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
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Info } from "lucide-react";

type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required: boolean;
};

type Clause = {
  title: string;
  text: string;
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { key: "vertragspartner", label: "Vertragspartner", type: "text", required: true },
  ]);
  const [clauses, setClauses] = useState<Clause[]>([
    { title: "Vertragsparteien", text: "" },
  ]);
  const [saving, setSaving] = useState(false);

  // ─── Field Handlers ─────────────────────────────────────────────────────────

  const addField = () => {
    setFields([
      ...fields,
      { key: `feld_${fields.length + 1}`, label: "", type: "text", required: false },
    ]);
  };

  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(
      fields.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, ...updates };
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

  // ─── Clause Handlers ────────────────────────────────────────────────────────

  const addClause = () => {
    setClauses([...clauses, { title: "", text: "" }]);
  };

  const removeClause = (index: number) => setClauses(clauses.filter((_, i) => i !== index));

  const updateClause = (index: number, updates: Partial<Clause>) => {
    setClauses(clauses.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const moveClause = (index: number, direction: "up" | "down") => {
    const newClauses = [...clauses];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newClauses.length) return;
    [newClauses[index], newClauses[target]] = [newClauses[target], newClauses[index]];
    setClauses(newClauses);
  };

  const insertPlaceholder = (clauseIndex: number, fieldKey: string) => {
    const clause = clauses[clauseIndex];
    updateClause(clauseIndex, {
      text: clause.text + `{{${fieldKey}}}`,
    });
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name ist erforderlich");
    if (fields.length === 0) return toast.error("Mindestens ein Feld erforderlich");
    if (fields.some((f) => !f.label.trim())) return toast.error("Alle Felder brauchen ein Label");
    if (clauses.length > 0 && clauses.some((c) => !c.title.trim())) {
      return toast.error("Alle Klauseln brauchen einen Titel");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          fields,
          clauses: clauses.filter((c) => c.title.trim()),
        }),
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Neue Vorlage</h1>
        <p className="text-muted-foreground">
          Definiere Felder und Vertragsklauseln mit dynamischen Platzhaltern.
        </p>
      </div>

      {/* Basic Info */}
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

      {/* Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Dynamische Felder ({fields.length})</CardTitle>
            <CardDescription>
              Diese Felder werden beim Erstellen eines Dokuments ausgefüllt und als {"{{platzhalter}}"} in Klauseln eingesetzt.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Feld
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Feldname</Label>
                  <Input
                    placeholder="z.B. Mieter Name"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                  />
                  {field.key && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Platzhalter: <code className="bg-muted px-1 rounded">{`{{${field.key}}}`}</code>
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Typ</Label>
                  <Select
                    value={field.type}
                    onValueChange={(val) => updateField(index, { type: val as Field["type"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  onChange={(e) => updateField(index, { required: e.target.checked })}
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
        </CardContent>
      </Card>

      {/* Clauses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Vertragsklauseln ({clauses.length})</CardTitle>
            <CardDescription>
              Schreibe Vertragstext mit {"{{platzhaltern}}"} für dynamische Werte. Jede Klausel wird als § nummeriert.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addClause}>
            <Plus className="h-4 w-4 mr-1" />
            Klausel
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {clauses.map((clause, index) => (
            <div key={index} className="rounded-lg border overflow-hidden">
              {/* Clause Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
                <span className="text-sm font-medium text-muted-foreground">§ {index + 1}</span>
                <Input
                  className="border-0 bg-transparent font-medium p-0 h-auto focus-visible:ring-0"
                  placeholder="Klauseltitel"
                  value={clause.title}
                  onChange={(e) => updateClause(index, { title: e.target.value })}
                />
                <div className="flex gap-1 ml-auto shrink-0">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    disabled={index === 0}
                    onClick={() => moveClause(index, "up")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    disabled={index === clauses.length - 1}
                    onClick={() => moveClause(index, "down")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeClause(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Clause Text */}
              <div className="p-4 space-y-3">
                <Textarea
                  placeholder="Vertragstext hier eingeben... Verwende {{feldname}} für dynamische Werte."
                  value={clause.text}
                  onChange={(e) => updateClause(index, { text: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />

                {/* Insert Placeholder Buttons */}
                {fields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Klick zum Einfügen:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {fields
                        .filter((f) => f.key)
                        .map((f) => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => insertPlaceholder(index, f.key)}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            {`{{${f.key}}}`}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {clauses.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <p>Keine Klauseln. Klicke &quot;Klausel&quot; um Vertragstext hinzuzufügen.</p>
              <p className="text-xs mt-1">Ohne Klauseln wird das PDF nur die Felder als Liste darstellen.</p>
            </div>
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
