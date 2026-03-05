import { db } from "./index";
import { contracts, auditLogs, users, templates, documents } from "./schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import type { CreateContractInput, UpdateContractInput } from "@/lib/validations/contract";

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function getContracts(filters?: {
  search?: string;
  status?: string;
}) {
  let query = db
    .select()
    .from(contracts)
    .orderBy(desc(contracts.createdAt));

  if (filters?.status && filters.status !== "all") {
    return db
      .select()
      .from(contracts)
      .where(eq(contracts.status, filters.status as any))
      .orderBy(desc(contracts.createdAt));
  }

  if (filters?.search) {
    return db
      .select()
      .from(contracts)
      .where(
        or(
          like(contracts.title, `%${filters.search}%`),
          like(contracts.counterparty, `%${filters.search}%`)
        )
      )
      .orderBy(desc(contracts.createdAt));
  }

  return query;
}

export async function getContractById(id: string) {
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, id))
    .limit(1);
  return contract ?? null;
}

export async function createContract(
  data: CreateContractInput,
  userId: string
) {
  const [contract] = await db
    .insert(contracts)
    .values({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      createdById: userId,
    })
    .returning();
  return contract;
}

export async function updateContract(id: string, data: UpdateContractInput) {
  const [contract] = await db
    .update(contracts)
    .set({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, id))
    .returning();
  return contract;
}

export async function deleteContract(id: string) {
  await db.delete(contracts).where(eq(contracts.id, id));
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const all = await db.select({ status: contracts.status }).from(contracts);
  const total = all.length;
  const active = all.filter((c) => c.status === "active").length;
  const expiring = all.filter((c) => c.status === "expiring_soon").length;
  const draft = all.filter((c) => c.status === "draft").length;
  const expired = all.filter((c) => c.status === "expired").length;
  return { total, active, expiring, draft, expired };
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function createAuditLog(
  userId: string,
  action: string,
  resourceId?: string,
  resourceType?: string,
  metadata?: object
) {
  await db.insert(auditLogs).values({
    userId,
    action,
    resourceId,
    resourceType,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

export async function getAuditLogs(limit = 20) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resourceId: auditLogs.resourceId,
      resourceType: auditLogs.resourceType,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "admin" | "user" | "viewer";
}) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates() {
  return db.select().from(templates).orderBy(desc(templates.createdAt));
}

export async function getTemplateById(id: string) {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);
  return template ?? null;
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  fields: string;
  createdById: string;
}) {
  const [template] = await db.insert(templates).values(data).returning();
  return template;
}

export async function deleteTemplate(id: string) {
  await db.delete(templates).where(eq(templates.id, id));
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getDocumentsByContract(contractId: string) {
  return db
    .select({
      id: documents.id,
      contractId: documents.contractId,
      templateId: documents.templateId,
      fieldValues: documents.fieldValues,
      fileUrl: documents.fileUrl,
      fileName: documents.fileName,
      createdAt: documents.createdAt,
      templateName: templates.name,
    })
    .from(documents)
    .leftJoin(templates, eq(documents.templateId, templates.id))
    .where(eq(documents.contractId, contractId))
    .orderBy(desc(documents.createdAt));
}

export async function createDocument(data: {
  contractId: string;
  templateId: string;
  fieldValues: string;
  fileUrl?: string;
  fileName?: string;
  createdById: string;
}) {
  const [doc] = await db.insert(documents).values(data).returning();
  return doc;
}
