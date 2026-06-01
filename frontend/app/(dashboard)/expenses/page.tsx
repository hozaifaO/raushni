import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="Expense Management"
      modulePath="expenses"
      defaultCategory="operations"
      description="Record operational expenses, amounts, dates, locations, approval state, and audit notes."
    />
  );
}
