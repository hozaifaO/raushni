#!/usr/bin/env node

const apiUrl = (process.env.API_BASE_URL || process.env.API_PUBLIC_URL || "https://api.raushni-dev.com").replace(/\/$/, "");
const apiKey = process.env.INTERNAL_API_KEY || process.env.CRUD_SMOKE_API_KEY || "";
const headers = {
  "Content-Type": "application/json",
  "X-User-Role": process.env.CRUD_SMOKE_ROLE || "ADMIN",
  "X-User-Email": process.env.CRUD_SMOKE_EMAIL || "admin@raushni.com",
  "User-Agent": "raushni-dashboard-crud-smoke/1.0",
};
if (apiKey) {
  headers["X-API-Key"] = apiKey;
}

function stamp() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function request(method, path, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${text}`);
  }
  return { status: response.status, payload };
}

const today = "2026-05-31";
const future = "2026-12-31";

const simpleRecord = (moduleName) => ({
  title: `CRUD Smoke ${moduleName} ${stamp()}`,
  category: "smoke",
  summary: `Temporary ${moduleName} record created by dashboard CRUD smoke test.`,
  status: "active",
  record_date: today,
  contact_name: "Admin User",
  contact_email: "admin@raushni.com",
  amount: 100,
  location: "Raushni Dev",
  notes: "Delete-safe temporary smoke record.",
});

const cases = [
  {
    name: "members",
    path: "/api/v1/members",
    create: () => ({
      full_name: `CRUD Smoke Member ${stamp()}`,
      email: `crud.member.${stamp()}@example.org`,
      phone: "+919999999999",
      role: "Volunteer",
      status: "active",
      joined_on: today,
      address: "Raushni Dev",
      emergency_contact: "+918888888888",
      notes: "Temporary smoke record.",
    }),
    update: { status: "pending", notes: "Updated by smoke test." },
  },
  {
    name: "donations",
    path: "/api/v1/donations",
    create: () => ({
      donor_name: `CRUD Smoke Donor ${stamp()}`,
      donor_email: `crud.donor.${stamp()}@example.org`,
      donor_phone: "+919999999998",
      donor_type: "individual",
      amount: 501,
      currency: "INR",
      purpose: "general",
      payment_method: "cash",
      payment_status: "paid",
      transaction_reference: `SMOKE-${stamp()}`,
      donation_date: today,
      notes: "Temporary smoke donation.",
    }),
    update: { payment_status: "pending", notes: "Updated by smoke test." },
  },
  {
    name: "designations",
    path: "/api/v1/designations",
    create: () => ({
      title: `CRUD Smoke Designation ${stamp()}`,
      code: `SMK-${stamp()}`.slice(0, 30),
      department: "Operations",
      level: "volunteer",
      status: "active",
      reports_to: "Program Lead",
      description: "Temporary designation created by CRUD smoke test.",
      assignment_scope: "Smoke test workflow",
      responsibilities: ["Create", "Update", "Delete"],
      required_documents: ["ID proof"],
      staff_assigned: 0,
      volunteer_slots: 1,
      sort_order: 999,
      cms_slug: null,
      notes: "Temporary smoke record.",
    }),
    update: { status: "inactive", notes: "Updated by smoke test." },
  },
  {
    name: "projects",
    path: "/api/v1/projects",
    create: () => ({
      title: `CRUD Smoke Project ${stamp()}`,
      slug: `crud-smoke-project-${stamp()}`,
      summary: "Temporary project created by dashboard CRUD smoke test.",
      location: "Raushni Dev",
      focus_area: "Operations",
      status: "proposed",
      priority: "medium",
      start_date: today,
      end_date: future,
      budget: 1000,
      currency: "INR",
      beneficiaries: 10,
      schools_targeted: 1,
      progress: 5,
      manager: "Admin User",
      objectives: ["Verify create", "Verify update", "Verify delete"],
      milestones: ["Smoke test"],
      risks: ["None"],
      notes: "Temporary smoke record.",
    }),
    update: { status: "active", progress: 10, notes: "Updated by smoke test." },
  },
  {
    name: "crowdfunding",
    path: "/api/v1/crowdfunding",
    create: () => ({
      title: `CRUD Smoke Campaign ${stamp()}`,
      slug: `crud-smoke-campaign-${stamp()}`,
      summary: "Temporary crowdfunding campaign created by CRUD smoke test.",
      category: "education",
      status: "draft",
      target_amount: 10000,
      amount_raised: 0,
      currency: "INR",
      start_date: today,
      end_date: future,
      location: "Raushni Dev",
      beneficiary_count: 10,
      owner: "Admin User",
      highlights: ["Smoke test"],
      impact_metrics: ["Temporary"],
      notes: "Temporary smoke record.",
    }),
    update: { status: "review", notes: "Updated by smoke test." },
  },
  ...["activities", "beneficiaries", "events", "news", "enquiries", "expenses"].map((name) => ({
    name,
    path: `/api/v1/${name}`,
    create: () => simpleRecord(name),
    update: { status: "published", notes: "Updated by smoke test." },
  })),
];

async function runCase(testCase) {
  const created = await request("POST", testCase.path, testCase.create());
  const id = created.payload?.id;
  if (!id) throw new Error(`${testCase.name} create did not return id`);
  await request("GET", `${testCase.path}/${id}`);
  await request("PATCH", `${testCase.path}/${id}`, testCase.update);
  await request("DELETE", `${testCase.path}/${id}`);
  console.log(`PASS ${testCase.name} CRUD`);
}

let failures = 0;
for (const testCase of cases) {
  try {
    await runCase(testCase);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`dashboard CRUD smoke failed: failures=${failures}`);
  process.exit(1);
}

console.log(`dashboard CRUD smoke passed: checked=${cases.length}`);
