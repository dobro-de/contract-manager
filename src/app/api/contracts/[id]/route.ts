import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateContractSchema } from "@/lib/validations/contract";
import {
  getContractById,
  updateContract,
  deleteContract,
  createAuditLog,
} from "@/lib/db/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await createAuditLog(session.user.id, "contract.viewed", id, "contract");

  return NextResponse.json(contract);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const contract = await updateContract(id, parsed.data);
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await createAuditLog(
    session.user.id,
    "contract.updated",
    id,
    "contract",
    { fields: Object.keys(parsed.data) }
  );

  return NextResponse.json(contract);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can delete
  const role = (session.user as any).role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteContract(id);
  await createAuditLog(
    session.user.id,
    "contract.deleted",
    id,
    "contract",
    { title: contract.title }
  );

  return NextResponse.json({ success: true });
}
