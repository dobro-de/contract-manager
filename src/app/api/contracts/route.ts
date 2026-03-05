import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createContractSchema } from "@/lib/validations/contract";
import { getContracts, createContract, createAuditLog } from "@/lib/db/queries";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success, remaining } = rateLimit(`api:${session.user.id}`, 60);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const data = await getContracts({ search, status });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const contract = await createContract(parsed.data, session.user.id);

  await createAuditLog(
    session.user.id,
    "contract.created",
    contract.id,
    "contract",
    { title: contract.title }
  );

  return NextResponse.json(contract, { status: 201 });
}
