import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Get token from cookies instead of localStorage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwtToken='))
        ?.split('=')[1];
        
      if (!token) {
        setError('Please log in to view your cart');
        setLoading(false);
        return;
      }
      
      const res = await axios.get('http://localhost:6969/cart', {
        headers: { 'x-auth-token': token }
      });
      setCart(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError('Failed to load cart');
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setUpdatingItem(itemId);
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwtToken='))
        ?.split('=')[1];
        
      await axios.put(`http://localhost:6969/cart/update/${itemId}`, { quantity }, {
        headers: { 'x-auth-token': token }
      });
      await fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwtToken='))
        ?.split('=')[1];
        
      await axios.delete(`http://localhost:6969/cart/remove/${itemId}`, {
        headers: { 'x-auth-token': token }
      });
      await fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (loading) return <div className="text-center py-10">Loading cart...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      {(!cart || cart.items.length === 0) ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/store')}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded object-cover" src={item.product.image} alt={item.product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={updatingItem === item._id}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={updatingItem === item._id}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    &#8377;{item.product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                    &#8377;{(item.product.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={updatingItem === item._id}
                      >
                        {updatingItem === item._id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
            <div>
              <button
                onClick={() => navigate('/store')}
                className="text-blue-600 hover:text-blue-800"
              >
                Continue Shopping
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-lg mb-2">
                <span className="font-medium">Total:</span> <span className="font-bold">&#8377;{calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;