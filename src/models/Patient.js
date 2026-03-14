import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  phone:     { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', ''] , default: '' },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContact: {
    name:     { type: String, default: '' },
    relation: { type: String, default: '' },
    phone:    { type: String, default: '' },
  },
  insuranceId: { type: String, default: '' },
  address:     { type: String, default: '' },
  admissionStatus: { 
    type: String, 
    enum: ['NORMAL', 'ADMITTED', 'DISCHARGED', 'TREATED'], 
    default: 'NORMAL' 
  },
}, { timestamps: true });

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
