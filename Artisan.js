const mongoose = require('mongoose');

const ArtisanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'health', 'education', 'social services', 'construction', 
      'fashion', 'grooming', 'hospitality', 'automotive', 'home maintenance'
    ]
  },
  region: { type: String, required: true },
  city: { type: String, required: true },
  community: { type: String, required: true },
  bio: { type: String, required: true },
  portfolioImages: [{ type: String }],
  rating: { type: Number, default: 5.0, min: 1, max: 5 },
  isVerified: { type: Boolean, default: false },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  // Sensitive variables. Kept hidden on public client requests.
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  whatsapp: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Artisan', ArtisanSchema);