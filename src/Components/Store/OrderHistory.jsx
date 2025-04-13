import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get token from cookies instead of localStorage
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('jwtToken='))
          ?.split('=')[1];
        const res = await axios.get('http://localhost:6969/order/my-orders', {
          headers: { 'x-auth-token': token }
        });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="text-center py-10">Loading your orders...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <button 
            onClick={() => navigate('/store')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="font-medium">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="font-bold text-lg mt-1">&#8377;{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-gray-50 text-sm text-blue-600 hover:underline">
                View Order Details
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;