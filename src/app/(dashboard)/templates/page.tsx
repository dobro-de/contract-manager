import { getTemplates } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSignature } from "lucide-react";
import Link from "next/link";
import type { TemplateField } from "@/lib/pdf/generate";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vorlagen</h1>
          <p className="text-muted-foreground">
            PDF-Vorlagen mit individuellen Feldern
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Vorlage
          </Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Keine Vorlagen vorhanden</h2>
          <p className="text-muted-foreground mb-4">
            Erstelle eine Vorlage mit individuellen Feldern.
          </p>
          <Link href="/templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Erste Vorlage erstellen
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const fields: TemplateField[] = JSON.parse(template.fields);
            return (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {fields.map((f) => (
                      <Badge key={f.key} variant="secondary" className="text-xs">
                        {f.label}
                        {f.required && " *"}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {fields.length} Felder
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
