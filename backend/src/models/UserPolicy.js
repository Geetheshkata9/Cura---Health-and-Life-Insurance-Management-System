import mongoose from 'mongoose';

const userPolicySchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  policyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'lapsed', 'claimed'], default: 'active' },
  paymentStatus: { type: String, required: true, default: 'pending' },
  coveredMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  beneficiary: { type: String }
}, { timestamps: true });

export default mongoose.model('UserPolicy', userPolicySchema);
