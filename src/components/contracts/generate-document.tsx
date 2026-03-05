"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown } from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string | null;
  fields: string;
};

type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required: boolean;
};

export function GenerateDocument({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/templates")
        .then((r) => r.json())
        .then(setTemplates)
        .catch(() => toast.error("Vorlagen konnten nicht geladen werden"));
    }
  }, [open]);

  const fields: Field[] = selectedTemplate
    ? JSON.parse(selectedTemplate.fields)
    : [];

  const handleGenerate = async () => {
    // Check required fields
    for (const field of fields) {
      if (field.required && !fieldValues[field.key]?.trim()) {
        toast.error(`"${field.label}" ist ein Pflichtfeld`);
        return;
      }
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          templateId: selectedTemplate!.id,
          fieldValues,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Fehler" }));
        toast.error(err.error ?? "Fehler bei der PDF-Generierung");
        return;
      }

      // If response is PDF (no blob storage)
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ??
          "vertrag.pdf";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF generiert und heruntergeladen!");
      } else {
        // Blob storage URL
        const data = await res.json();
        if (data.fileUrl) {
          window.open(data.fileUrl, "_blank");
        }
        toast.success("Dokument generiert!");
      }

      setOpen(false);
      setSelectedTemplate(null);
      setFieldValues({});
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          PDF erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dokument aus Vorlage erstellen</DialogTitle>
        </DialogHeader>

        {/* Template Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vorlage auswählen</Label>
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Vorlagen vorhanden. Erstelle zuerst eine unter Vorlagen.
              </p>
            ) : (
              <Select
                onValueChange={(id) => {
                  const t = templates.find((t) => t.id === id);
                  setSelectedTemplate(t ?? null);
                  setFieldValues({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vorlage wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Dynamic Fields */}
          {selectedTemplate && fields.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Felder ausfüllen:</p>
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-sm">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues({ ...fieldValues, [field.key]: e.target.value })
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues({ ...fieldValues, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedTemplate || generating}
          >
            {generating ? "Generiert..." : "PDF generieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
