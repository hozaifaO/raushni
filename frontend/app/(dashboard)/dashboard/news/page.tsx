import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="News Management"
      modulePath="news"
      defaultCategory="announcement"
      description="Manage news items, announcements, publishing status, source notes, and content workflow records."
    />
  );
}
