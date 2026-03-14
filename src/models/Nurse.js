import mongoose from 'mongoose';

const NurseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  licenseNumber: { type: String, required: true, unique: true },
  licenseBody: { type: String, default: 'PNC' },
  specialization: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  zones: [{ type: String }],
  availableDays: [{ type: String }],
  visitRate: { type: Number, default: 0 },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  activePatients: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Nurse || mongoose.model('Nurse', NurseSchema);
