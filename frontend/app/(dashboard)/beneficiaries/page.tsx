import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="Beneficiary Management"
      modulePath="beneficiaries"
      defaultCategory="education"
      description="Create, update, search, and archive beneficiary records for program support, field follow-up, and reporting."
    />
  );
}
