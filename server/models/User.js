const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => {
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9000) + 1000;
      return `MSV-${timestamp}-${random}`;
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null],
    default: null
  },
  lastActive: {
    type: Date,
    default: null
  },
  resetOtp: {
    type: String,
    default: null
  },
  resetOtpExpiry: {
    type: Date,
    default: null
  },
  addresses: [{
    name: { type: String, required: [true, 'Name is required'] },
    mobile: { type: String, required: [true, 'Mobile is required'] },
    pincode: { type: String, required: [true, 'Pincode is required'] },
    state: { type: String, required: [true, 'State is required'] },
    address: { type: String, required: [true, 'Address is required'] },
    landmark: { type: String, required: [true, 'Landmark is required'] },
    district: { type: String, required: [true, 'District is required'] },
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cartItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, default: 1, min: 1 },
    size: { type: String, default: '' }
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
