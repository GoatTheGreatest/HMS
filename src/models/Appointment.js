import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['VIRTUAL', 'PHYSICAL', 'HOME_VISIT'],
    default: 'PHYSICAL',
  },
  status: {
    type: String,
    enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'PENDING',
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, default: '' }, // e.g. '10:30 AM'
  chiefComplaint: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL',
  },
  notes: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  prescription: { type: String, default: '' },
  visitAddress: {
    street: { type: String, default: '' },
    city:   { type: String, default: '' },
  },
  videoMeetingUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
