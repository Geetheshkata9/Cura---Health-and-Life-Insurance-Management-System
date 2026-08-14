import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['health', 'life'], required: true, index: true },
  coverageAmount: { type: Number, required: true },
  premium: { type: Number, required: true },
  termYears: { type: Number, required: true },
  benefits: [{ type: String }],
  eligibility: { type: String },
  waitingPeriodDays: { type: Number },
  roomRentLimit: { type: Number },
  familySizeLimit: { type: Number },
  premiumFrequency: { type: String, enum: ['Monthly', 'Yearly'], default: 'Monthly' }
}, { timestamps: true });

export default mongoose.model('Policy', policySchema);
