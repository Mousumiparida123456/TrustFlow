import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "trustflow_salt").digest("hex");
}

const DEMO_USERS = [
  { username: "alice_johnson", riskLevel: "low", trustScore: 12 },
  { username: "bob_smith", riskLevel: "medium", trustScore: 45 },
  { username: "carol_white", riskLevel: "high", trustScore: 72 },
  { username: "david_chen", riskLevel: "low", trustScore: 15 },
  { username: "eve_attacker", riskLevel: "critical", trustScore: 95 },
  { username: "frank_miller", riskLevel: "low", trustScore: 10 },
];

async function seed() {
  console.log("Seeding demo users...");

  for (const demoUser of DEMO_USERS) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, demoUser.username));
    
    if (existing.length === 0) {
      console.log(`Creating user: ${demoUser.username}`);
      await db.insert(usersTable).values({
        username: demoUser.username,
        email: `${demoUser.username}@example.com`,
        passwordHash: hashPassword("demo123"),
        trustScore: demoUser.trustScore,
        riskLevel: demoUser.riskLevel,
        isActive: true,
        location: demoUser.username === "eve_attacker" ? "Kyiv, Ukraine" : "New York, US",
        device: demoUser.username === "eve_attacker" ? "Linux VM" : "Chrome on Windows",
      });
    } else {
      console.log(`User ${demoUser.username} already exists, updating password...`);
      await db.update(usersTable).set({
        passwordHash: hashPassword("demo123"),
      }).where(eq(usersTable.username, demoUser.username));
    }
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
