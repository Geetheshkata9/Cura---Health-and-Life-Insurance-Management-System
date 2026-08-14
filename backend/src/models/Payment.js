import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userPolicyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPolicy', required: true, index: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentType: { type: String, enum: ['monthly', 'custom'], required: true },
  note: { type: String },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
