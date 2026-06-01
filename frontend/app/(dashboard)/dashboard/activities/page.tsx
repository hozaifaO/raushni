import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="Activity Posts"
      modulePath="activities"
      defaultCategory="program"
      description="Manage activity records for public updates, operational history, and CMS-aligned program documentation."
    />
  );
}
