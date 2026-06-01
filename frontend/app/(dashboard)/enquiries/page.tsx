import SimpleCrudPage from "@/components/Dashboard/SimpleCrudPage";

export default function Page() {
  return (
    <SimpleCrudPage
      title="Enquiry Management"
      modulePath="enquiries"
      defaultCategory="contact"
      description="Track contact, volunteer, donor, and program enquiries with follow-up status and notes."
    />
  );
}
