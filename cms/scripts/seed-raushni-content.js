"use strict";

const strapiFactory = require("@strapi/strapi");

const landingPageUid = "api::landing-page.landing-page";

const landingPageContent = {
  title: "Raushni Educational & Social Welfare Trust",
  heroEyebrow: "Community-led education, healthcare, and dignity",
  heroSubtitle:
    "A focused social welfare trust helping underserved families access learning, basic healthcare, livelihood support, and emergency relief with dignity.",
  aboutHeading: "Lighting practical pathways out of poverty and illiteracy.",
  vision:
    "Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every person, regardless of socio-economic background, has equal access to quality education, essential healthcare, and dignified livelihood opportunities. Our work is rooted in listening, local participation, and measurable community progress.",
  missionHeading: "Sustainable change, one family at a time.",
  mission:
    "To empower underserved communities through education support, healthcare access, skill development, women-led livelihoods, environmental care, and responsive relief programs that create long-term confidence and opportunity.",
  focusAreas: [
    { title: "Education", text: "Bridge learning gaps through mentoring, digital literacy, school readiness, books, and structured academic support." },
    { title: "Healthcare", text: "Improve access to basic care, health camps, nutrition awareness, referrals, and preventive community health practices." },
    { title: "Livelihood", text: "Support self-help groups, vocational skills, savings habits, micro-enterprise readiness, and dignified income pathways." },
    { title: "Environment", text: "Promote tree plantation, cleanliness drives, waste awareness, and local responsibility for safer public spaces." },
  ],
  objectives: [
    "Formal and digital education for children and adults",
    "Healthcare and nutrition access for marginalized families",
    "Vocational training, self-help groups, and sustainable livelihoods",
    "Women and adolescent girls' safety, dignity, and economic independence",
    "Tree plantation, waste management, and environmental care",
    "Digital and financial inclusion for rural communities",
    "Emergency relief during natural disasters",
    "Community mobilization, advocacy, and strategic partnerships",
  ].map((item) => `- ${item}`).join("\n"),
  successHeading: "Progress shaped by community trust.",
  successIntro:
    "Every initiative begins with listening. Programs are designed around local needs, volunteer action, and tangible improvements in dignity for families.",
  successStories: [
    "A classroom closer to home: Children from underserved families receive structured learning support, books, and mentoring that keeps them connected to school.",
    "Women building income: Self-help group training helps women gain confidence, manage savings, and explore small-enterprise opportunities.",
    "Relief with dignity: During emergencies, volunteers coordinate food, medicine, and essentials through trusted local community networks.",
  ].map((item) => `- ${item}`).join("\n"),
  volunteerHeading: "Bring your time, skill, network, or care.",
  volunteerIntro:
    "Volunteers support teaching, health camps, field coordination, content, fundraising, disaster relief, and community mobilization. Every contribution helps a family move with more confidence.",
  volunteerWays: ["Teach or mentor", "Support health camps", "Document stories", "Coordinate relief", "Sponsor learning material"],
  contactHeading: "Let's build a more equitable community.",
  contactAddress: "Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113",
  contactPhone: "+91 997 3955 7600",
  contactEmail: "info@raushni.com",
  publishedAt: new Date(),
};

async function enablePublicLandingRead(app) {
  const publicRole = await app
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) return;

  const permissionService = app.plugin("users-permissions").service("permission");
  const permissions = await permissionService.findRolePermissions(publicRole.id);
  const landingPermissions = permissions[landingPageUid]?.controllers?.["landing-page"];

  if (!landingPermissions?.find) {
    console.warn("landing-page find permission shape not found; check Strapi users-permissions manually.");
    return;
  }

  landingPermissions.find.enabled = true;
  await permissionService.updateRolePermissions(publicRole.id, permissions);
  console.log("Enabled public read access for landing-page.");
}

async function main() {
  const app = await strapiFactory().load();

  try {
    const existing = await app.db.query(landingPageUid).findOne();
    if (existing) {
      await app.db.query(landingPageUid).update({ where: { id: existing.id }, data: landingPageContent });
      console.log("Updated Raushni landing-page content in Strapi.");
    } else {
      await app.db.query(landingPageUid).create({ data: landingPageContent });
      console.log("Created Raushni landing-page content in Strapi.");
    }

    await enablePublicLandingRead(app);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error("Failed to seed Raushni Strapi content.");
  console.error(error);
  process.exit(1);
});
