import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  userPolicyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPolicy', required: true, index: true },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimAmount: { type: Number, required: true },
  reason: { type: String, required: true },
  incidentDate: { type: Date, required: true },
  proofDocuments: [{ type: String }],
  status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending', index: true },
  adminRemarks: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Claim', claimSchema);
