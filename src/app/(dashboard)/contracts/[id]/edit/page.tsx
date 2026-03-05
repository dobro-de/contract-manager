import { getContractById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ContractForm } from "@/components/contracts/contract-form";

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vertrag bearbeiten</h1>
        <p className="text-muted-foreground">{contract.title}</p>
      </div>
      <ContractForm mode="edit" contract={contract} />
    </div>
  );
}
