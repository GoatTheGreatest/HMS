import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  phoneNumber: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  // Encrypted medical fields
  encryptedMedicalHistory: { type: String }, // Store encrypted JSON string or reference to secured vault
  encryptedAllergies: { type: String },
}, { timestamps: true });

export default mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema);
