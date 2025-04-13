const express = require('express');
const router = express.Router();
const Cart = require('../Models/Cart');
const Product = require('../Models/Product');
const Prescription = require('../Models/Prescription');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ patient: req.user.id })
      .populate('items.product', 'name price image stock requiresPrescription');
    
    if (!cart) {
      cart = new Cart({ patient: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity, prescriptionId } = req.body;
    
    // Validate product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough product in stock' });
    }
    
    // Check if prescription is required and valid
    if (product.requiresPrescription) {
      if (!prescriptionId) {
        return res.status(400).json({ message: 'This product requires a prescription' });
      }
      
      // Verify the prescription belongs to the user and is valid
      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patient: req.user.id,
        expiryDate: { $gt: Date.now() }
      });
      
      if (!prescription) {
        return res.status(400).json({ message: 'Valid prescription required' });
      }
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) {
      cart = new Cart({ patient: req.user.id, items: [] });
    }
    
    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        prescriptionId: prescriptionId || null
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product', 'name price image');
    
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    const cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough product in stock' });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product', 'name price image');
    
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find and remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product', 'name price image');
    
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;