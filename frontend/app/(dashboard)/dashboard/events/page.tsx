import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="Event Management"
      modulePath="events"
      defaultCategory="community"
      description="Create, schedule, update, publish, close, and archive community events and trust programs."
    />
  );
}
