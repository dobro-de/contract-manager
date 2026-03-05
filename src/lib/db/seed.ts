import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // Demo User
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Vincent Dobro",
      email: "demo@contract-manager.app",
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (!admin) {
    console.log("User already exists, skipping...");
    process.exit(0);
  }

  console.log(`✅ User: demo@contract-manager.app / Demo1234!`);

  // Demo Contracts
  const demoContracts = [
    {
      title: "Büromietvertrag Hamburg",
      counterparty: "Alster Immobilien GmbH",
      status: "active" as const,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2027-12-31"),
      value: 48000,
      notes: "Büro im 3. OG, 120m², inkl. 2 Stellplätze. Kündigungsfrist 6 Monate.",
      createdById: admin.id,
    },
    {
      title: "Cloud Hosting Vertrag",
      counterparty: "Hetzner Online GmbH",
      status: "active" as const,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2026-02-28"),
      value: 2400,
      notes: "Dedicated Server CX41, Frankfurt. Monatlich kündbar nach Mindestlaufzeit.",
      createdById: admin.id,
    },
    {
      title: "SaaS Lizenz CRM",
      counterparty: "HubSpot Inc.",
      status: "expiring_soon" as const,
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      value: 9600,
      notes: "Professional Plan, 5 Seats. Renewal Gespräch im Februar planen.",
      createdById: admin.id,
    },
    {
      title: "Wartungsvertrag Aufzug",
      counterparty: "Schindler Deutschland AG",
      status: "active" as const,
      startDate: new Date("2023-06-01"),
      endDate: new Date("2028-05-31"),
      value: 6000,
      notes: "Vollwartung inkl. Notdienst 24/7. Jährliche TÜV-Prüfung inklusive.",
      createdById: admin.id,
    },
    {
      title: "Reinigungsvertrag Büro",
      counterparty: "CleanTech Services GmbH",
      status: "active" as const,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      value: 7200,
      notes: "3x wöchentlich, Mo/Mi/Fr. Glasreinigung quartalsmäßig.",
      createdById: admin.id,
    },
    {
      title: "Arbeitsvertrag Entwickler",
      counterparty: "Max Mustermann",
      status: "draft" as const,
      startDate: new Date("2026-04-01"),
      endDate: null,
      value: 72000,
      notes: "Fullstack Developer, unbefristet. Probezeit 6 Monate. Remote-Regelung: 3 Tage/Woche.",
      createdById: admin.id,
    },
    {
      title: "Versicherung Betriebshaftpflicht",
      counterparty: "Allianz Versicherungs-AG",
      status: "expired" as const,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      value: 1800,
      notes: "Deckung bis 5 Mio €. NICHT VERLÄNGERT — Wechsel zu HDI prüfen!",
      createdById: admin.id,
    },
    {
      title: "Kooperationsvertrag Marketing",
      counterparty: "Branding Brothers UG",
      status: "active" as const,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2026-05-31"),
      value: 18000,
      notes: "Social Media + Content Marketing. Monatliches Reporting. KPI-basierter Bonus.",
      createdById: admin.id,
    },
  ];

  await db.insert(schema.contracts).values(demoContracts);
  console.log(`✅ ${demoContracts.length} Demo-Verträge angelegt`);

  // Audit Logs
  await db.insert(schema.auditLogs).values(
    demoContracts.map((c) => ({
      userId: admin.id,
      action: "contract.created",
      resourceType: "contract",
      metadata: JSON.stringify({ title: c.title }),
    }))
  );
  console.log("✅ Audit Logs angelegt");

  console.log("\n🎉 Seed complete!");
  console.log("Login: demo@contract-manager.app / Demo1234!");
}

seed().catch(console.error);
