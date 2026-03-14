import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  genericName: { type: String, default: '' },
  category:    { type: String, required: true },
  manufacturer:{ type: String, default: '' },
  supplier:    { type: String, default: '' },
  stock:       { type: Number, required: true, default: 0 },
  unit:        { type: String, default: 'Tablets' },
  lowStockThreshold: { type: Number, default: 50 },
  expiryDate:  { type: Date, required: true },
  batchNumber: { type: String, default: '' },
  price:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
