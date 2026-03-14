import mongoose from 'mongoose';

const ProfessionalProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String },
  licenseNumber: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  consultationFee: { type: Number },
  location: {
    address: String,
    city: String,
    state: String,
  },
  // Availability details could be a complex sub-document, kept simple here
  availability: {
    days: [String], // e.g., ['Monday', 'Wednesday']
    startTime: String, // e.g., '09:00'
    endTime: String, // e.g., '17:00'
  },
  homeVisitAvailable: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.ProfessionalProfile || mongoose.model('ProfessionalProfile', ProfessionalProfileSchema);
