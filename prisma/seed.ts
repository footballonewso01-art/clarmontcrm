import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (Production Mode)...\n");

  // Clean existing data for a fresh start
  await prisma.payoutAgency.deleteMany();
  await prisma.payoutWorker.deleteMany();
  await prisma.conversion.deleteMany();
  await prisma.trackingLink.deleteMany();
  await prisma.model.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcryptjs.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@crm.com",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user restored: admin@crm.com / admin123");

  console.log("\n🎉 Seed complete! No demo data was loaded.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
