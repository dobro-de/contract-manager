import { ContractForm } from "@/components/contracts/contract-form";

export default function NewContractPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Neuer Vertrag</h1>
        <p className="text-muted-foreground">Lege einen neuen Vertrag an.</p>
      </div>
      <ContractForm mode="create" />
    </div>
  );
}
