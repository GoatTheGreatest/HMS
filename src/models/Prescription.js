import mongoose from 'mongoose';

const MedicineItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  dosage:   { type: String, default: '' },
  duration: { type: String, default: '' },
  notes:    { type: String, default: '' },
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis:     { type: String, required: true },
  medicines:     [MedicineItemSchema],
  notes:         { type: String, default: '' },
  validUntil:    { type: Date },
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
