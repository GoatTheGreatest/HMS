import mongoose from 'mongoose';

const PharmaceuticalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName:   { type: String, default: '' },
  lastName:    { type: String, default: '' },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  companyName: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Pharmaceutical || mongoose.model('Pharmaceutical', PharmaceuticalSchema);
