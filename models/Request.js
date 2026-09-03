const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  clientPhone: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, trim: true },
  serviceCategory: { type: String, required: true },
  description: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  location: { type: String, required: true },
  artisanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  adminResponse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);