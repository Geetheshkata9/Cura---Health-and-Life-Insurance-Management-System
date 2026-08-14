import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String }, // Optional, since Better Auth credential passwords reside in the accounts collection
  role: { type: String, enum: ['customer', 'agent', 'admin'], default: 'customer' },
  phone: { type: String },
  address: { type: String },
  emailVerified: { type: Boolean, default: false },
  image: { type: String, default: 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=User' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
