import mongoose from 'mongoose';

const HomeVisitSchema = new mongoose.Schema({
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, default: '' },
  address:     { type: String, required: true },
  scheduledTime: { type: String, default: '' }, // e.g. '10:00 AM'
  scheduledDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['NEW', 'SCHEDULED', 'EN_ROUTE', 'COMPLETED', 'CANCELLED'],
    default: 'NEW',
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL',
  },
  notes: { type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.HomeVisit || mongoose.model('HomeVisit', HomeVisitSchema);
