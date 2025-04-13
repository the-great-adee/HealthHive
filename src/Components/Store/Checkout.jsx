import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'creditCard'
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Get token from cookies instead of localStorage
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('jwtToken='))
          ?.split('=')[1];
          
        if (!token) {
          setError('Please log in to view your cart');
          setLoading(false);
          navigate('/login');
          return;
        }
        
        const res = await axios.get('http://localhost:6969/cart', {
          headers: { 'x-auth-token': token }
        });
        
        if (!res.data || res.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCart(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cart');
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessingOrder(true);
      // Get token from cookies instead of localStorage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwtToken='))
        ?.split('=')[1];
        
      if (!token) {
        setError('Please log in to complete your order');
        setProcessingOrder(false);
        return;
      }
      
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };
      
      const res = await axios.post('http://localhost:6969/order', orderData, {
        headers: { 'x-auth-token': token }
      });
      
      navigate(`/order/confirmation/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order');
      setProcessingOrder(false);
    }
  };

  if (loading) return <div>Loading checkout...</div>;
  if (error) return <div>{error}</div>;
  if (!cart) return <div>No items in cart</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={formData.paymentMethod === 'creditCard'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Credit Card
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    PayPal
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cashOnDelivery"
                      checked={formData.paymentMethod === 'cashOnDelivery'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={processingOrder}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {processingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <div className="flex">
                    <div className="h-16 w-16 flex-shrink-0">
                      <img className="h-16 w-16 rounded object-cover" src={item.product.image} alt={item.product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                  &#8377;{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>&#8377;{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>&#8377;0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>&#8377;{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;