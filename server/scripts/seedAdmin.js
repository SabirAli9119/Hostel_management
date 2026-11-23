/*
 * Creates the initial admin account from environment variables.
 *   npm run seed:admin              create the admin if it does not exist
 *   npm run seed:admin -- --reset   also reset the admin password from ADMIN_PASSWORD
 * Admins can never be created through public registration.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { validateRegister } = require('../utils/validators');

const run = async () => {
  const env = process.env;
  const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) throw new Error(`Set ${missing.join(', ')} in server/.env first.`);

  // Reuse the same rules residents follow (username, password strength, phone, DOB).
  const v = validateRegister({
    fullName: env.ADMIN_FULL_NAME || 'Hostel Admin',
    username: env.ADMIN_USERNAME,
    dob: env.ADMIN_DOB || '1990-01-01',
    gender: env.ADMIN_GENDER || 'Other',
    phone: env.ADMIN_PHONE || '9999999999',
    roomType: 'Single Sharing', // required by the validator, not stored for admins
    password: env.ADMIN_PASSWORD,
    confirmPassword: env.ADMIN_PASSWORD,
  });

  await connectDB();
  await User.init();

  const existing = await User.findOne({ username: v.username });
  if (existing) {
    if (existing.role !== 'admin') throw new Error(`"${v.username}" is a resident account. Choose another ADMIN_USERNAME.`);
    if (process.argv.includes('--reset')) {
      existing.password = v.password;
      await existing.save();
      console.log(`Admin "${v.username}" password was reset.`);
    } else {
      console.log(`Admin "${v.username}" already exists. Use --reset to change its password.`);
    }
    return;
  }

  await User.create({
    fullName: v.fullName,
    username: v.username,
    dob: v.dob,
    gender: v.gender,
    phone: v.phone,
    password: v.password,
    role: 'admin',
    status: 'active',
  });
  console.log(`Admin created. Sign in with username "${v.username}" and the password from your .env file.`);
};

run()
  .catch((err) => {
    const detail = err.errors ? ` ${JSON.stringify(err.errors)}` : '';
    console.error(`Seed failed: ${err.message}${detail}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
