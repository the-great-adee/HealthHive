const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  category: {
    type: String,
    required: true,
    enum: ['Medication', 'Equipment', 'Supplements', 'FirstAid', 'Personal Care']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  manufacturer: {
    type: String,
    required: true
  },
  activeIngredients: [{
    type: String
  }],
  dosage: {
    type: String
  },
  sideEffects: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);