import { memberFormSchema, memberSchema } from "@/lib/validation/member";

const validMember = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  full_name: "Aisha Khan",
  email: "aisha@example.org",
  phone: "+91 9876543210",
  role: "Volunteer",
  status: "active" as const,
  joined_on: "2026-05-17",
  address: "Hyderabad",
  emergency_contact: "+91 9000000000",
  notes: "Weekend coordinator",
  created_at: "2026-05-17T10:00:00Z",
  updated_at: "2026-05-17T10:00:00Z",
};

describe("memberSchema", () => {
  it("accepts a valid member payload", () => {
    expect(memberSchema.parse(validMember)).toEqual(validMember);
  });

  it("accepts null optional fields", () => {
    const result = memberSchema.parse({
      ...validMember,
      email: null,
      address: null,
      emergency_contact: null,
      notes: null,
    });
    expect(result.email).toBeNull();
  });

  it("rejects invalid status", () => {
    expect(() => memberSchema.parse({ ...validMember, status: "banned" })).toThrow();
  });

  it("rejects missing required fields", () => {
    const { full_name: _, ...rest } = validMember;
    expect(() => memberSchema.parse(rest)).toThrow();
  });

  it("rejects non-uuid id", () => {
    expect(() => memberSchema.parse({ ...validMember, id: "not-a-uuid" })).toThrow();
  });
});

describe("memberFormSchema", () => {
  it("accepts trimmed valid form values", () => {
    const result = memberFormSchema.parse({
      full_name: "  Aisha Khan  ",
      email: "aisha@example.org",
      phone: "+919876543210",
      role: "Volunteer",
      status: "active",
      joined_on: "2026-05-17",
      address: "",
      emergency_contact: "",
      notes: "",
    });
    expect(result.full_name).toBe("Aisha Khan");
  });

  it("rejects too-short name", () => {
    expect(() =>
      memberFormSchema.parse({
        full_name: "A",
        email: "",
        phone: "+919876543210",
        role: "Volunteer",
        status: "active",
        joined_on: "2026-05-17",
        address: "",
        emergency_contact: "",
        notes: "",
      }),
    ).toThrow();
  });
});
