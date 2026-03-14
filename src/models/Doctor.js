import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseBody: { type: String, default: 'PMDC' },
  experience: { type: Number, default: 0 },
  qualifications: [{ degree: String, institution: String, year: Number }],
  consultationFee: { type: Number, default: 0 },
  availableDays: [{ type: String }],
  bio: { type: String, default: '' },
  location: {
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  rating: { type: Number, default: 0 },
  totalPatients: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
