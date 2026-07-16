import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ASSET_KEYS, YEAR1_RATE, TRAILING_RATE } from "../src/lib/enums";
import { slugify, randomReferralCode } from "../src/lib/slug";

const db = new PrismaClient();
const PASSWORD = "omnicard123";

type SeedPartner = {
  firmName: string;
  contactName: string;
  email: string;
  city: string;
  state: string;
  stage: "LEAD" | "MEETING_SCHEDULED" | "ONBOARDING" | "CERTIFIED" | "ACTIVE" | "DORMANT";
  icp: [number, number, number, number, number, number, number];
  clients: number; // closed-won leads to generate
};

const FIRMS: SeedPartner[] = [
  { firmName: "Sharma & Associates", contactName: "Priya Sharma", email: "priya.sharma@camail.in", city: "Delhi", state: "Delhi", stage: "ACTIVE", icp: [23, 18, 13, 9, 10, 9, 9], clients: 12 },
  { firmName: "Mehta Tax Advisors", contactName: "Rohan Mehta", email: "rohan.mehta@camail.in", city: "Delhi", state: "Delhi", stage: "ACTIVE", icp: [20, 15, 10, 8, 10, 8, 7], clients: 6 },
  { firmName: "Kapoor & Kapoor CAs", contactName: "Anjali Kapoor", email: "anjali.kapoor@camail.in", city: "Gurugram", state: "Haryana", stage: "CERTIFIED", icp: [18, 14, 9, 7, 8, 7, 6], clients: 2 },
  { firmName: "Verma Financial Consultants", contactName: "Suresh Verma", email: "suresh.verma@camail.in", city: "Noida", state: "Uttar Pradesh", stage: "ACTIVE", icp: [22, 17, 12, 9, 9, 9, 8], clients: 9 },
  { firmName: "Iyer & Co Chartered Accountants", contactName: "Lakshmi Iyer", email: "lakshmi.iyer@camail.in", city: "Bengaluru", state: "Karnataka", stage: "ACTIVE", icp: [21, 16, 11, 8, 8, 10, 9], clients: 5 },
  { firmName: "Reddy Compliance Partners", contactName: "Kiran Reddy", email: "kiran.reddy@camail.in", city: "Bengaluru", state: "Karnataka", stage: "ONBOARDING", icp: [16, 12, 8, 6, 7, 6, 5], clients: 0 },
  { firmName: "Desai & Shah CAs", contactName: "Neha Desai", email: "neha.desai@camail.in", city: "Mumbai", state: "Maharashtra", stage: "ACTIVE", icp: [24, 19, 14, 9, 9, 9, 9], clients: 11 },
  { firmName: "Joshi Advisory", contactName: "Aditya Joshi", email: "aditya.joshi@camail.in", city: "Mumbai", state: "Maharashtra", stage: "MEETING_SCHEDULED", icp: [14, 10, 7, 5, 6, 5, 4], clients: 0 },
  { firmName: "Patel & Sons Accountancy", contactName: "Mihir Patel", email: "mihir.patel@camail.in", city: "Ahmedabad", state: "Gujarat", stage: "CERTIFIED", icp: [19, 14, 10, 7, 8, 7, 6], clients: 1 },
  { firmName: "Krishnan Tax & Audit", contactName: "Vijay Krishnan", email: "vijay.krishnan@camail.in", city: "Chennai", state: "Tamil Nadu", stage: "ACTIVE", icp: [20, 15, 11, 8, 8, 8, 7], clients: 6 },
  { firmName: "Nair Financial Services", contactName: "Arun Nair", email: "arun.nair@camail.in", city: "Pune", state: "Maharashtra", stage: "LEAD", icp: [9, 7, 5, 4, 5, 4, 3], clients: 0 },
  { firmName: "Bansal Chartered Accountants", contactName: "Ritu Bansal", email: "ritu.bansal@camail.in", city: "Pune", state: "Maharashtra", stage: "LEAD", icp: [12, 9, 6, 5, 6, 5, 4], clients: 0 },
];

const BUSINESS_NAMES = [
  "Northwind Traders", "Bluepeak Textiles", "Sunrise Logistics", "Greenfield Foods",
  "Urban Nest Interiors", "Aster Healthcare", "Bright Wheels Auto", "Cedar Consulting",
  "Delta Manufacturing", "Everest Exports", "Falcon Media", "Golden Harvest Agro",
  "Horizon Retail", "Ironclad Security", "Jupiter Electronics", "Kaveri Textiles",
  "Lotus Wellness", "Maple Furnishings", "Nimbus Cloud Services", "Orbit Travels",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding database...");

  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.loginAttempt.deleteMany();
  await db.badge.deleteMany();
  await db.commission.deleteMany();
  await db.referralBonus.deleteMany();
  await db.activityEvent.deleteMany();
  await db.campaign.deleteMany();
  await db.assetKitItem.deleteMany();
  await db.lead.deleteMany();
  await db.user.deleteMany();
  await db.partner.deleteMany();
  await db.kpiSnapshot.deleteMany();

  const admin = await db.user.create({
    data: {
      email: "admin@omnicard.in",
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      name: "Ananya Rao",
      role: "ADMIN",
      mustChangePassword: false,
    },
  });
  // Three OmniCard Team members share one role (marketing/sales/accounts/PM
  // all operate the same CRM with the same rights); two are flagged as
  // sales reps so round-robin lead assignment has more than one rep to
  // pick from out of the box.
  await db.user.create({
    data: {
      email: "ops@omnicard.in",
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      name: "Karan Mehra",
      role: "OMNICARD_TEAM",
      isSalesRep: true,
      assignmentPriority: 0,
      mustChangePassword: false,
    },
  });
  await db.user.create({
    data: {
      email: "sales@omnicard.in",
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      name: "Divya Nair",
      role: "OMNICARD_TEAM",
      isSalesRep: true,
      assignmentPriority: 1,
      mustChangePassword: false,
    },
  });
  await db.user.create({
    data: {
      email: "marketing@omnicard.in",
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      name: "Farhan Sheikh",
      role: "OMNICARD_TEAM",
      mustChangePassword: false,
    },
  });

  let businessIdx = 0;
  const partnerIds: string[] = [];

  for (const f of FIRMS) {
    const slug = slugify(f.firmName);
    const [icpClients, icpAdvisory, icpTech, icpSize, icpGeo, icpDigital, icpMindset] = f.icp;

    const partner = await db.partner.create({
      data: {
        firmName: f.firmName,
        contactName: f.contactName,
        email: f.email,
        phone: `9${randomBetween(100000000, 999999999)}`,
        city: f.city,
        state: f.state,
        slug,
        referralCode: randomReferralCode(f.firmName),
        stage: f.stage,
        icaiNumber: `ICAI${randomBetween(100000, 999999)}`,
        icaiVerified: f.stage !== "LEAD" && f.stage !== "MEETING_SCHEDULED",
        msaSignedAt: f.stage === "LEAD" || f.stage === "MEETING_SCHEDULED" ? null : new Date(Date.now() - randomBetween(30, 200) * 86400000),
        demoAttendedAt: f.stage === "CERTIFIED" || f.stage === "ACTIVE" ? new Date(Date.now() - randomBetween(20, 180) * 86400000) : null,
        certifiedAt: f.stage === "CERTIFIED" || f.stage === "ACTIVE" ? new Date(Date.now() - randomBetween(15, 170) * 86400000) : null,
        icpClients, icpAdvisory, icpTech, icpSize, icpGeo, icpDigital, icpMindset,
      },
    });
    partnerIds.push(partner.id);

    if (f.stage === "CERTIFIED" || f.stage === "ACTIVE") {
      await db.user.create({
        data: {
          email: f.email,
          passwordHash: await bcrypt.hash(PASSWORD, 10),
          name: f.contactName,
          role: "CA",
          partnerId: partner.id,
          firmRole: "OWNER",
          mustChangePassword: false,
        },
      });

      await db.assetKitItem.createMany({
        data: ASSET_KEYS.map((key, i) => ({
          partnerId: partner.id,
          key,
          status: i < ASSET_KEYS.length - 2 ? "DELIVERED" : "IN_PROGRESS",
          owner: key === "CERTIFICATE_BADGE" || key === "FIRST_CAMPAIGN_DRAFT" ? "Auto (CRM)" : "Marketing Ops",
          deliveredAt: i < ASSET_KEYS.length - 2 ? new Date(Date.now() - randomBetween(1, 100) * 86400000) : null,
        })),
      });

      await db.campaign.createMany({
        data: [
          { partnerId: partner.id, type: "EMAIL", title: "Spend Leakage Audit Email", status: "SENT", sentAt: new Date(), approvedAt: new Date() },
          { partnerId: partner.id, type: "WHATSAPP", title: "WhatsApp Nudge Pack", status: "PENDING_APPROVAL" },
          { partnerId: partner.id, type: "NEWSLETTER", title: "Monthly Practice Newsletter", status: "APPROVED", approvedAt: new Date() },
        ],
      });

      const leadCount = f.clients + randomBetween(1, 4);
      for (let i = 0; i < leadCount; i++) {
        const isClosedWon = i < f.clients;
        const dealValue = randomBetween(30000, 120000);
        const business = BUSINESS_NAMES[businessIdx % BUSINESS_NAMES.length];
        businessIdx++;
        const stage = isClosedWon
          ? "CLOSED_WON"
          : (["CAPTURED", "QUALIFIED", "CONTACTED", "DEMO", "PROPOSAL"] as const)[randomBetween(0, 4)];
        const closedAt = isClosedWon
          ? new Date(Date.now() - randomBetween(1, 85) * 86400000)
          : null;

        const lead = await db.lead.create({
          data: {
            partnerId: partner.id,
            businessName: `${business} ${f.city}`,
            contactName: `Contact ${businessIdx}`,
            phone: `9${randomBetween(100000000, 999999999)}`,
            email: `contact${businessIdx}@example.com`,
            source: (["MICROSITE", "QR_SCAN", "WEBINAR", "CALCULATOR", "WHATSAPP"] as const)[randomBetween(0, 4)],
            stage,
            dealValue,
            closedAt,
          },
        });

        if (isClosedWon) {
          await db.commission.create({
            data: {
              partnerId: partner.id,
              leadId: lead.id,
              type: "YEAR1",
              amount: Math.round(dealValue * YEAR1_RATE),
              status: "CREDITED",
              creditedAt: closedAt,
            },
          });
          await db.commission.create({
            data: {
              partnerId: partner.id,
              leadId: lead.id,
              type: "TRAILING",
              amount: Math.round(dealValue * TRAILING_RATE),
              status: "CREDITED",
              creditedAt: closedAt,
            },
          });
        }
      }

      // Milestone badges based on total closed-won clients this "quarter"
      const now = new Date();
      const quarter = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
      let badgeTier: "NONE" | "SILVER" | "GOLD" | "PLATINUM" = "NONE";
      if (f.clients >= 10) badgeTier = "GOLD";
      else if (f.clients >= 5) badgeTier = "SILVER";

      if (badgeTier !== "NONE") {
        await db.badge.create({
          data: { partnerId: partner.id, tier: badgeTier, quarter, clientsAtMilestone: f.clients },
        });
        await db.partner.update({ where: { id: partner.id }, data: { badgeTier } });
      }

      await db.activityEvent.createMany({
        data: Array.from({ length: randomBetween(5, 15) }).map(() => ({
          partnerId: partner.id,
          type: (["SHARE", "CLICK", "QR_SCAN", "CAMPAIGN_SENT"] as const)[randomBetween(0, 3)],
        })),
      });
    }
  }

  // A couple of partner-referred-partner relationships (Step 8 flywheel)
  const [referrer, referred] = partnerIds;
  if (referrer && referred) {
    await db.partner.update({ where: { id: referred }, data: { referredById: referrer } });
    await db.referralBonus.create({
      data: { referrerId: referrer, referredId: referred, amount: 5000, status: "CREDITED" },
    });
  }

  // Flagship demo account (Sharma & Associates) — payout details, a teammate,
  // and a notification feed so Phase 1 features have something to show.
  const flagship = partnerIds[0];
  if (flagship) {
    await db.partner.update({
      where: { id: flagship },
      data: {
        bankAccountName: "Sharma & Associates",
        bankAccountNumber: "50100123456789",
        bankIfsc: "HDFC0001234",
        upiId: "sharma.associates@okhdfcbank",
        pan: "AAAPS1234C",
        gstNumber: "07AAAPS1234C1ZQ",
      },
    });

    const flagshipUser = await db.user.findFirst({ where: { partnerId: flagship } });
    await db.user.create({
      data: {
        email: "rohit.sharma.associate@camail.in",
        passwordHash: await bcrypt.hash(PASSWORD, 10),
        name: "Rohit Sharma",
        role: "CA",
        partnerId: flagship,
        firmRole: "MEMBER",
        mustChangePassword: false,
      },
    });

    if (flagshipUser) {
      await db.notification.createMany({
        data: [
          {
            userId: flagshipUser.id,
            type: "COMMISSION_CREDITED",
            title: "Rs 13,500 credited for Northwind Traders Delhi",
            body: "Year-1 and trailing commission have been credited to your wallet.",
            href: "/partner/leads",
          },
          {
            userId: flagshipUser.id,
            type: "BADGE_EARNED",
            title: "GOLD Advisor badge earned!",
            body: "10 clients closed this quarter — smartwatch / premium gadget + Rs 15,000 voucher.",
            href: "/partner/badges",
            readAt: new Date(),
          },
          {
            userId: flagshipUser.id,
            type: "CAMPAIGN_PENDING",
            title: "New campaign ready for your approval: WhatsApp Nudge Pack",
            body: "OmniCard drafted this campaign for your clients — approve it in one click.",
            href: "/partner/campaigns",
          },
        ],
      });
    }
  }

  // A few audit log entries so the admin Audit Log page isn't empty
  await db.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        actorName: admin.name,
        action: "CERTIFY_PARTNER",
        targetType: "Partner",
        meta: "Sharma & Associates",
      },
      {
        actorId: admin.id,
        actorName: admin.name,
        action: "ADVANCE_LEAD_STAGE",
        targetType: "Lead",
        meta: "Northwind Traders Delhi -> CLOSED_WON",
      },
    ],
  });

  // Weekly KPI snapshots for the last 6 weeks (Step 9)
  for (let i = 5; i >= 0; i--) {
    const weekOf = new Date(Date.now() - i * 7 * 86400000);
    await db.kpiSnapshot.create({
      data: {
        weekOf,
        costPerPartnerLead: randomBetween(350, 550),
        visitorToSignupPct: 6 + Math.random() * 5,
        signupToCertifiedPct: 55 + Math.random() * 25,
        avgDaysToCertify: 5 + Math.random() * 4,
        certifiedToFirstCampaignPct: 45 + Math.random() * 25,
        leadToDemoPct: 30 + Math.random() * 20,
        demoToClosePct: 18 + Math.random() * 15,
        slaPct: 88 + Math.random() * 10,
        clientsPerActiveCA: 3 + Math.random() * 4,
        nps: 40 + Math.random() * 25,
        dormancyPct: 15 + Math.random() * 20,
        referredSharePct: 10 + Math.random() * 20,
      },
    });
  }

  console.log(`Seeded ${FIRMS.length} partners.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
