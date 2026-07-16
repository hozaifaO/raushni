import { simpleRecordFormSchema, simpleRecordSchema } from "@/lib/validation/simpleRecord";

const validRecord = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  module: "activities",
  title: "Community cleanup",
  category: "outreach",
  summary: "Neighborhood cleanup drive with volunteers.",
  status: "active" as const,
  record_date: "2026-06-01",
  contact_name: "Ravi",
  contact_email: "ravi@example.org",
  amount: 1500,
  location: "Hyderabad",
  notes: null,
  created_at: "2026-06-01T09:00:00Z",
  updated_at: "2026-06-01T09:00:00Z",
};

describe("simpleRecordSchema", () => {
  it("accepts a valid simple record", () => {
    expect(simpleRecordSchema.parse(validRecord)).toEqual(validRecord);
  });

  it("accepts null amount and contacts", () => {
    const result = simpleRecordSchema.parse({
      ...validRecord,
      contact_name: null,
      contact_email: null,
      amount: null,
    });
    expect(result.amount).toBeNull();
  });

  it("rejects invalid status", () => {
    expect(() => simpleRecordSchema.parse({ ...validRecord, status: "deleted" })).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() => simpleRecordSchema.parse({ ...validRecord, amount: -1 })).toThrow();
  });
});

describe("simpleRecordFormSchema", () => {
  it("accepts valid form values", () => {
    const result = simpleRecordFormSchema.parse({
      title: "Community cleanup",
      category: "outreach",
      summary: "Neighborhood cleanup drive with volunteers.",
      status: "draft",
      record_date: "2026-06-01",
      contact_name: "",
      contact_email: "",
      amount: "",
      location: "",
      notes: "",
    });
    expect(result.title).toBe("Community cleanup");
  });

  it("rejects short summary", () => {
    expect(() =>
      simpleRecordFormSchema.parse({
        title: "Cleanup",
        category: "outreach",
        summary: "Hi",
        status: "draft",
        record_date: "2026-06-01",
        contact_name: "",
        contact_email: "",
        amount: "",
        location: "",
        notes: "",
      }),
    ).toThrow();
  });
});
