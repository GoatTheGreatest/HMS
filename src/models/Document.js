import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String, // e.g. S3 Bucket URL
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String, // e.g. application/pdf, image/jpeg
  },
  documentType: {
    type: String,
    enum: ['LAB_RESULT', 'PRESCRIPTION', 'SCAN', 'OTHER'],
    default: 'OTHER',
  },
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
