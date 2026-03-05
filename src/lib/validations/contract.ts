import { z } from "zod";

export const createContractSchema = z.object({
  title: z.string().min(2, "Titel ist zu kurz").max(200),
  counterparty: z.string().min(2, "Vertragspartner fehlt").max(200),
  status: z.enum(["draft", "active", "expiring_soon", "expired"]).default("draft"),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  value: z.number().int().positive().optional().nullable(),
  currency: z.string().length(3).default("EUR"),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial();

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
