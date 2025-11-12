import bcrypt from "bcryptjs";
import { prisma } from "../src/infrastructure/database/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create default roles
  console.log("📝 Creating default roles...");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: {
        name: "SUPER_ADMIN",
        description: "Super Administrator with full access",
      },
    }),
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
        description: "Administrator with management access",
      },
    }),
    prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: {
        name: "USER",
        description: "Regular user with basic access",
      },
    }),
  ]);

  console.log("✅ Roles created successfully!");

  // Find SUPER_ADMIN role
  const superAdminRole = roles.find((r) => r.name === "SUPER_ADMIN");

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Administrator",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // Count created records
  const roleCount = await prisma.role.count();
  const userCount = await prisma.user.count();
  const userRoleCount = await prisma.userRole.count();

  console.log("\n📊 Database Statistics:");
  console.log(`   • Roles: ${roleCount}`);
  console.log(`   • Users: ${userCount}`);
  console.log(`   • User Roles: ${userRoleCount}`);

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
