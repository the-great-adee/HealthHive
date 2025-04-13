const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const mongoose = require('mongoose');

// 🔍 Search products – place this before `/:id`
router.get('/search/:keyword', async (req, res) => {
  try {
    const regex = new RegExp(req.params.keyword, 'i');
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { manufacturer: regex },
        { activeIngredients: regex }
      ]
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📦 Get all products
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📦 Get single product by ID (validate ID first)
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ➕ Create product (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// ✏️ Update product (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// ❌ Delete product (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
