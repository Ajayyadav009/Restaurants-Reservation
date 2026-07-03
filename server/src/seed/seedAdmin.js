const User = require("../models/User");


const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`Admin account already exists: ${existingAdmin.email}`);
      return;
    }

    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@restaurant.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName     = process.env.ADMIN_NAME     || "Admin";

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log(`✅ Admin account seeded — email: ${adminEmail}  password: ${adminPassword}`);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

module.exports = seedAdmin;
