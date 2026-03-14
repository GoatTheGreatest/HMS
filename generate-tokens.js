const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
  const User = require('./src/models/User').default;
  
  const doctor = await User.findOne({ role: 'DOCTOR' }).lean();
  const patient = await User.findOne({ role: 'PATIENT' }).lean();
  const pharma = await User.findOne({ role: 'PHARMACEUTICAL' }).lean();

  const doctorToken = doctor ? jwt.sign({ id: doctor._id, role: doctor.role, email: doctor.email }, JWT_SECRET, { expiresIn: '1d' }) : null;
  const patientToken = patient ? jwt.sign({ id: patient._id, role: patient.role, email: patient.email }, JWT_SECRET, { expiresIn: '1d' }) : null;
  const pharmaToken = pharma ? jwt.sign({ id: pharma._id, role: pharma.role, email: pharma.email }, JWT_SECRET, { expiresIn: '1d' }) : null;

  console.log('Doctor ID:', doctor?._id);
  console.log('Doctor Token:', doctorToken);
  console.log('Patient ID:', patient?._id);
  console.log('Patient Token:', patientToken);
  console.log('Pharma ID:', pharma?._id);
  console.log('Pharma Token:', pharmaToken);

  process.exit(0);
}

main().catch(console.error);
