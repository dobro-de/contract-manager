import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "viewer"]);
export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "active",
  "expiring_soon",
  "expired",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contracts
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  counterparty: text("counterparty").notNull(), // Vertragspartner
  status: contractStatusEnum("status").notNull().default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  value: integer("value"), // Vertragswert in Cent
  currency: text("currency").notNull().default("EUR"),
  fileKey: text("file_key"), // S3 Key für PDF
  notes: text("notes"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Audit Log
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // z.B. "contract.created", "contract.viewed"
  resourceId: uuid("resource_id"),
  resourceType: text("resource_type"), // "contract"
  metadata: text("metadata"), // JSON string für extra Infos
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
