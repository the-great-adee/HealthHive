const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const Product = require('../Models/Product');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ patient: req.user.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }
    
    // Check product stock and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = item.product;
      
      // Check if product exists and has enough stock
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for product: ${product ? product.name : 'Unknown product'}` 
        });
      }
      
      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        prescriptionId: item.prescriptionId
      });
      
      // Add to total amount
      totalAmount += product.price * item.quantity;
      
      // Reduce product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    
    // Create the order
    const order = new Order({
      patient: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });
    
    await order.save();
    
    // Clear the cart
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for a patient
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 
      patient: req.user.id,
      isDeleted: { $ne: true } // Only return non-deleted orders
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Security check - only allow users to see their own orders
    if (order.patient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update order status
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order fields
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Cancel their own order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Security check - only allow users to cancel their own orders
    if (order.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Only allow cancellation if the order is still in "Processing" status
    if (order.status !== 'Processing') {
      return res.status(400).json({ message: 'Order cannot be canceled at this stage' });
    }
    
    // Update the status
    order.status = 'Cancelled';
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
    
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Hard delete also has (archive) their own order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Security check - only allow users to delete their own orders
    if (order.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
     // Option 1: Hard delete - completely remove the order
     await Order.findByIdAndDelete(req.params.id);
    
     // OR Option 2: Soft delete - just mark as deleted but keep in database
     // order.isDeleted = true;
     // await order.save();
    
    res.json({ message: 'Order removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;