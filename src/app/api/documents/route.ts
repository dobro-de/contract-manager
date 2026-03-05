import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTemplateById,
  getContractById,
  createDocument,
  createAuditLog,
} from "@/lib/db/queries";
import { generateContractPdf, type TemplateField } from "@/lib/pdf/generate";
import { put } from "@vercel/blob";
import { z } from "zod";

const createDocumentSchema = z.object({
  contractId: z.string(),
  templateId: z.string(),
  fieldValues: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { contractId, templateId, fieldValues } = parsed.data;

  const [contract, template] = await Promise.all([
    getContractById(contractId),
    getTemplateById(templateId),
  ]);

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 });
  }
  if (!template) {
    return NextResponse.json({ error: "Vorlage nicht gefunden" }, { status: 404 });
  }

  const fields: TemplateField[] = JSON.parse(template.fields);

  for (const field of fields) {
    if (field.required && !fieldValues[field.key]?.trim()) {
      return NextResponse.json(
        { error: `Feld "${field.label}" ist erforderlich` },
        { status: 400 }
      );
    }
  }

  const pdfBytes = await generateContractPdf(
    template.name,
    fields,
    fieldValues,
    contract.title
  );

  const fileName = `${contract.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "-")}_${Date.now()}.pdf`;

  let fileUrl: string | undefined;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`documents/${fileName}`, Buffer.from(pdfBytes), {
        access: "public",
        contentType: "application/pdf",
      });
      fileUrl = blob.url;
    }
  } catch (e) {
    console.warn("Blob upload skipped:", e);
  }

  const doc = await createDocument({
    contractId,
    templateId,
    fieldValues: JSON.stringify(fieldValues),
    fileUrl,
    fileName,
    createdById: session.user.id,
  });

  await createAuditLog(
    session.user.id,
    "document.generated",
    doc.id,
    "document",
    { contractTitle: contract.title, templateName: template.name }
  );

  if (!fileUrl) {
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Document-Id": doc.id,
      },
    });
  }

  return NextResponse.json({ ...doc, fileUrl }, { status: 201 });
}
