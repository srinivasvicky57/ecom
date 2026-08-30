const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Atlas Connection
const mongoUser = encodeURIComponent(process.env.MONGO_USER);
const mongoPass = encodeURIComponent(process.env.MONGO_PASS);
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoDB = process.env.MONGO_DB;
const MONGODB_URI = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}/${mongoDB}?retryWrites=true&w=majority`;

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error:', err.message);
});

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB initial connection failed:', err.message));

// Routes
const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banner');
const categoryRoutes = require('./routes/category');
const infoRoutes = require('./routes/info');
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/product');
const productCodeImageRoutes = require('./routes/productCodeImage');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const addressRoutes = require('./routes/address');
const orderRoutes = require('./routes/order');
const settingsRoutes = require('./routes/settings');
app.use('/api/auth', authRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-code-images', productCodeImageRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'MS Vastravarna API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
