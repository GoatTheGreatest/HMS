// seed.mjs — run with: node scripts/seed.mjs
// Seeds the HMS database with demo users, doctors, nurses, medicines, appointments, and home visits.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';

// ─── Connect ────────────────────────────────────────────────────────────────
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB:', MONGODB_URI);

// ─── Schemas (inline, no imports) ───────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  email: String, password: String, role: String,
  firstName: { type: String, default: '' }, lastName: { type: String, default: '' },
  phone: { type: String, default: '' }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String, lastName: String,
  specialization: String, licenseNumber: String, licenseBody: { type: String, default: 'PMDC' },
  experience: Number, consultationFee: Number, availableDays: [String],
  bio: String, location: { address: String, city: String },
  verificationStatus: { type: String, default: 'VERIFIED' },
  verifiedAt: Date, rating: Number, totalPatients: Number,
}, { timestamps: true });
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

const NurseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String, lastName: String,
  licenseNumber: String, licenseBody: { type: String, default: 'PNC' },
  specialization: String, experience: Number,
  verificationStatus: { type: String, default: 'VERIFIED' },
  verifiedAt: Date, activePatients: { type: Number, default: 0 },
}, { timestamps: true });
const Nurse = mongoose.models.Nurse || mongoose.model('Nurse', NurseSchema);

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String, lastName: String, phone: String,
  gender: String, bloodGroup: String,
  allergies: [String], chronicConditions: [String],
}, { timestamps: true });
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

const PharmSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String, lastName: String, companyName: String,
  licenseNumber: String,
  verificationStatus: { type: String, default: 'VERIFIED' },
}, { timestamps: true });
const Pharm = mongoose.models.Pharmaceutical || mongoose.model('Pharmaceutical', PharmSchema);

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, default: 'PHYSICAL' },
  status: { type: String, default: 'COMPLETED' },
  date: Date, timeSlot: String, chiefComplaint: String,
  priority: { type: String, default: 'NORMAL' },
  diagnosis: { type: String, default: '' },
  prescription: { type: String, default: '' },
}, { timestamps: true });
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

const MedicineSchema = new mongoose.Schema({
  name: String, genericName: String, category: String, manufacturer: String,
  stock: Number, unit: { type: String, default: 'Tablets' },
  lowStockThreshold: { type: Number, default: 50 },
  expiryDate: Date, batchNumber: String, price: Number,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

const HomeVisitSchema = new mongoose.Schema({
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: String, address: String, scheduledTime: String,
  scheduledDate: Date,
  status: { type: String, default: 'NEW' },
  priority: { type: String, default: 'NORMAL' },
  notes: { type: String, default: '' },
}, { timestamps: true });
const HomeVisit = mongoose.models.HomeVisit || mongoose.model('HomeVisit', HomeVisitSchema);

// ─── Hash helper ─────────────────────────────────────────────────────────────
const hash = (pw) => bcrypt.hash(pw, 10);

// ─── Upsert helper ───────────────────────────────────────────────────────────
async function upsertUser({ email, password, role, firstName, lastName }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, password: await hash(password), role, firstName, lastName });
    console.log(`  Created ${role}: ${email}`);
  } else {
    console.log(`  Exists  ${role}: ${email}`);
  }
  return user;
}

// ─── Clear old seed data (optional) ──────────────────────────────────────────
console.log('\n🗑️  Dropping existing seed data…');
await Promise.all([
  User.deleteMany({ email: { $regex: '@hms.com' } }),
  Doctor.deleteMany({}),
  Nurse.deleteMany({}),
  Patient.deleteMany({}),
  Pharm.deleteMany({}),
  Appointment.deleteMany({}),
  Medicine.deleteMany({}),
  HomeVisit.deleteMany({}),
]);

// ─── Create Users ────────────────────────────────────────────────────────────
console.log('\n👤 Creating users…');
const admin  = await upsertUser({ email: 'admin@hms.com',  password: 'admin1234',  role: 'ADMIN',          firstName: 'System',  lastName: 'Admin' });
const doc1   = await upsertUser({ email: 'doctor@hms.com', password: 'doctor1234', role: 'DOCTOR',         firstName: 'Sarah',   lastName: 'Ahmed' });
const doc2   = await upsertUser({ email: 'doctor2@hms.com',password: 'doctor1234', role: 'DOCTOR',         firstName: 'Kamran',  lastName: 'Butt' });
const nurse1 = await upsertUser({ email: 'nurse@hms.com',  password: 'nurse1234',  role: 'NURSE',          firstName: 'Ayesha',  lastName: 'Jamil' });
const pat1   = await upsertUser({ email: 'patient@hms.com',password: 'patient1234',role: 'PATIENT',        firstName: 'Ali',     lastName: 'Hassan' });
const pat2   = await upsertUser({ email: 'patient2@hms.com',password:'patient1234', role: 'PATIENT',        firstName: 'Sara',    lastName: 'Khan' });
const pat3   = await upsertUser({ email: 'patient3@hms.com',password:'patient1234', role: 'PATIENT',        firstName: 'Omar',    lastName: 'Siddiqui' });
const pharma = await upsertUser({ email: 'pharma@hms.com', password: 'pharma1234', role: 'PHARMACEUTICAL', firstName: 'MedCo',   lastName: 'Rep' });

// ─── Doctor Profiles ─────────────────────────────────────────────────────────
console.log('\n🩺 Creating doctor profiles…');
await Doctor.create([
  { userId: doc1._id, firstName: 'Sarah', lastName: 'Ahmed', specialization: 'Cardiology', licenseNumber: 'PMDC-11001', licenseBody: 'PMDC', experience: 12, consultationFee: 2000, availableDays: ['Monday','Tuesday','Thursday'], bio: 'Specialist in interventional cardiology with 12 years of experience.', location: { address: 'Shaukat Khanum Hospital', city: 'Lahore' }, verificationStatus: 'VERIFIED', verifiedAt: new Date(), rating: 4.8, totalPatients: 320 },
  { userId: doc2._id, firstName: 'Kamran', lastName: 'Butt', specialization: 'Neurology', licenseNumber: 'PMDC-22002', licenseBody: 'PMDC', experience: 8, consultationFee: 1800, availableDays: ['Wednesday','Friday','Saturday'], bio: 'Neurologist specializing in stroke management and epilepsy.', location: { address: 'Jinnah Hospital', city: 'Karachi' }, verificationStatus: 'VERIFIED', verifiedAt: new Date(), rating: 4.5, totalPatients: 210 },
]);

// ─── Nurse Profile ───────────────────────────────────────────────────────────
console.log('\n🏥 Creating nurse profile…');
await Nurse.create({ userId: nurse1._id, firstName: 'Ayesha', lastName: 'Jamil', licenseNumber: 'PNC-30001', specialization: 'ICU Care', experience: 5, verificationStatus: 'VERIFIED', verifiedAt: new Date(), activePatients: 4 });

// ─── Patient Profiles ─────────────────────────────────────────────────────────
console.log('\n🤒 Creating patient profiles…');
await Patient.create([
  { userId: pat1._id, firstName: 'Ali', lastName: 'Hassan', phone: '0300-1234567', gender: 'male', bloodGroup: 'B+', allergies: ['Penicillin'], chronicConditions: ['Hypertension'] },
  { userId: pat2._id, firstName: 'Sara', lastName: 'Khan',  phone: '0321-7654321', gender: 'female', bloodGroup: 'O+', allergies: [], chronicConditions: ['Type 2 Diabetes'] },
  { userId: pat3._id, firstName: 'Omar', lastName: 'Siddiqui', phone: '0333-9876543', gender: 'male', bloodGroup: 'A+', allergies: [], chronicConditions: [] },
]);

// ─── Pharma Profile ───────────────────────────────────────────────────────────
console.log('\n💊 Creating pharma profile…');
await Pharm.create({ userId: pharma._id, firstName: 'MedCo', lastName: 'Rep', companyName: 'MedCo Pakistan', licenseNumber: 'DRAP-50001', verificationStatus: 'VERIFIED' });

// ─── Appointments ─────────────────────────────────────────────────────────────
console.log('\n📅 Creating appointments…');
const now = new Date();
const past   = (d) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
const future = (d) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);

await Appointment.create([
  { patientId: pat1._id, doctorId: doc1._id, date: past(10), timeSlot: '10:00 AM', type: 'PHYSICAL', status: 'COMPLETED', chiefComplaint: 'Chest pain and palpitations', priority: 'HIGH', diagnosis: 'Hypertension Stage 2', prescription: 'Amlodipine 5mg once daily' },
  { patientId: pat2._id, doctorId: doc1._id, date: past(5),  timeSlot: '11:00 AM', type: 'PHYSICAL', status: 'COMPLETED', chiefComplaint: 'High blood sugar', priority: 'NORMAL', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg twice daily' },
  { patientId: pat3._id, doctorId: doc2._id, date: past(3), timeSlot: '02:00 PM', type: 'PHYSICAL', status: 'COMPLETED', chiefComplaint: 'Severe headache and dizziness', priority: 'HIGH', diagnosis: 'Migraine', prescription: 'Sumatriptan 50mg as needed' },
  { patientId: pat1._id, doctorId: doc1._id, date: future(3), timeSlot: '10:30 AM', type: 'PHYSICAL', status: 'SCHEDULED', chiefComplaint: 'Follow-up for hypertension', priority: 'NORMAL' },
  { patientId: pat2._id, doctorId: doc2._id, date: future(7), timeSlot: '03:00 PM', type: 'VIRTUAL', status: 'PENDING', chiefComplaint: 'Routine check-up', priority: 'LOW' },
]);

// ─── Medicines ────────────────────────────────────────────────────────────────
console.log('\n💉 Creating medicines…');
const y = (n) => new Date(now.getFullYear() + n, now.getMonth(), now.getDate());
const m = (n) => new Date(now.getFullYear(), now.getMonth() + n, now.getDate());

await Medicine.create([
  { name: 'Amlodipine 5mg',    genericName: 'Amlodipine', category: 'Cardiovascular', manufacturer: 'Abbott',    stock: 450, unit: 'Tablets', lowStockThreshold: 100, expiryDate: y(2), batchNumber: 'B-2024-001', price: 250, addedBy: pharma._id },
  { name: 'Metformin 500mg',   genericName: 'Metformin',  category: 'Antidiabetics',  manufacturer: 'Getz',      stock: 380, unit: 'Tablets', lowStockThreshold: 100, expiryDate: y(1), batchNumber: 'B-2024-002', price: 180, addedBy: pharma._id },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin',category: 'Antibiotics',    manufacturer: 'GlaxoSmithKline', stock: 12, unit: 'Capsules', lowStockThreshold: 50, expiryDate: m(8), batchNumber: 'B-2023-003', price: 320, addedBy: pharma._id },
  { name: 'Insulin Glargine',  genericName: 'Glargine',   category: 'Antidiabetics',  manufacturer: 'Sanofi',    stock: 8,  unit: 'Vials', lowStockThreshold: 30, expiryDate: m(6), batchNumber: 'B-2023-004', price: 4500, addedBy: pharma._id },
  { name: 'Aspirin 75mg',      genericName: 'Aspirin',    category: 'Analgesics',      manufacturer: 'Bayer',     stock: 620, unit: 'Tablets', lowStockThreshold: 100, expiryDate: y(3), batchNumber: 'B-2025-005', price: 90, addedBy: pharma._id },
  { name: 'Omeprazole 20mg',   genericName: 'Omeprazole', category: 'Antacids',        manufacturer: 'AstraZeneca',stock: 310, unit: 'Capsules', lowStockThreshold: 80, expiryDate: y(2), batchNumber: 'B-2024-006', price: 200, addedBy: pharma._id },
  { name: 'Vitamin D3 1000IU', genericName: 'Cholecalciferol', category: 'Vitamins', manufacturer: 'GSK', stock: 540, unit: 'Tablets', lowStockThreshold: 100, expiryDate: y(2), batchNumber: 'B-2024-007', price: 350, addedBy: pharma._id },
  { name: 'Warfarin 5mg',      genericName: 'Warfarin',   category: 'Anticoagulants',  manufacturer: 'Pfizer',    stock: 18, unit: 'Tablets', lowStockThreshold: 40, expiryDate: m(4), batchNumber: 'B-2023-008', price: 600, addedBy: pharma._id },
  { name: 'Methotrexate 2.5mg',genericName: 'Methotrexate', category: 'Immunosuppressants', manufacturer: 'Wyeth', stock: 5, unit: 'Tablets', lowStockThreshold: 20, expiryDate: m(2), batchNumber: 'B-2022-009', price: 1200, addedBy: pharma._id },
  { name: 'Expired Paracetamol', genericName: 'Paracetamol', category: 'Analgesics', manufacturer: 'Hilton', stock: 30, unit: 'Tablets', lowStockThreshold: 50, expiryDate: m(-3), batchNumber: 'B-2021-010', price: 60, addedBy: pharma._id },
]);

// ─── Home Visits ──────────────────────────────────────────────────────────────
console.log('\n🏠 Creating home visits…');
await HomeVisit.create([
  { nurseId: nurse1._id, patientId: pat1._id, patientName: 'Ali Hassan',    address: '12-B Garden Road, Lahore', scheduledTime: '10:00 AM', scheduledDate: future(0), status: 'NEW',       priority: 'HIGH',   notes: 'Post-surgery wound care' },
  { nurseId: nurse1._id, patientId: pat2._id, patientName: 'Sara Khan',     address: '45 Canal View, Lahore',    scheduledTime: '1:30 PM',  scheduledDate: future(0), status: 'EN_ROUTE',  priority: 'NORMAL', notes: 'Insulin injection and monitoring' },
  { nurseId: nurse1._id, patientId: pat3._id, patientName: 'Omar Siddiqui', address: '7 Phase 3, DHA, Lahore',   scheduledTime: '4:00 PM',  scheduledDate: future(1), status: 'SCHEDULED', priority: 'NORMAL', notes: 'Dressing change' },
  { nurseId: nurse1._id, patientId: pat1._id, patientName: 'Ali Hassan',    address: '12-B Garden Road, Lahore', scheduledTime: '09:00 AM', scheduledDate: past(1),   status: 'COMPLETED', priority: 'HIGH',   notes: 'Completed successfully' },
]);

console.log('\n✅ Seed complete!\n');
console.log('─────────────────────────────────────────────────');
console.log('Login credentials:');
console.log('  Admin:  admin@hms.com       / admin1234');
console.log('  Doctor: doctor@hms.com      / doctor1234');
console.log('  Doctor: doctor2@hms.com     / doctor1234');
console.log('  Nurse:  nurse@hms.com       / nurse1234');
console.log('  Patient:patient@hms.com     / patient1234');
console.log('  Patient:patient2@hms.com    / patient1234');
console.log('  Pharma: pharma@hms.com      / pharma1234');
console.log('─────────────────────────────────────────────────\n');

await mongoose.disconnect();
