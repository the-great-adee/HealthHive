import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('jwtToken='))
          ?.split('=')[1];
          
        if (!token) {
          setError('Please log in to view order details');
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:6969/order/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) return <div className="pt-20 text-center">Loading order confirmation...</div>;
  if (error) return <div className="pt-20 text-center text-red-600">{error}</div>;
  if (!order) return <div className="pt-20 text-center">Order not found</div>;

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
        <p className="text-green-700">Your order has been successfully placed.</p>
        <p className="text-gray-600 mt-2">Order ID: {order._id}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Items</h3>
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
          <address className="not-italic">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
            {order.shippingAddress.country}
          </address>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Order Summary</h3>
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Shipping:</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Link to="/orders" className="text-blue-600 hover:underline">
            View All Orders
          </Link>
          <Link to="/store" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
