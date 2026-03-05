import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTemplates, createTemplate, createAuditLog } from "@/lib/db/queries";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  fields: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(["text", "date", "number", "textarea"]),
      required: z.boolean(),
    })
  ).min(1, "Mindestens ein Feld erforderlich"),
  clauses: z.array(
    z.object({
      title: z.string().min(1),
      text: z.string(),
    })
  ).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getTemplates();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const template = await createTemplate({
    name: parsed.data.name,
    description: parsed.data.description,
    fields: JSON.stringify(parsed.data.fields),
    clauses: parsed.data.clauses?.length ? JSON.stringify(parsed.data.clauses) : undefined,
    createdById: session.user.id,
  });

  await createAuditLog(
    session.user.id,
    "template.created",
    template.id,
    "template",
    { name: template.name }
  );

  return NextResponse.json(template, { status: 201 });
}
