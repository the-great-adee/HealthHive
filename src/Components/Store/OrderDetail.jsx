import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get token from cookies instead of localStorage
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

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={() => navigate('/orders')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Orders
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Order #{order._id.slice(-8)}</h1>
              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold mb-2">Shipping Information</h2>
          <div className="text-gray-700">
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-medium">&#8377;{item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          {/* <div className="flex justify-between text-sm mb-2">
            <span>Subtotal:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Shipping:</span>
            <span>${order.shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Tax:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div> */}
          
          {order.status === 'Processing' && (
            <div className="mt-6">
              <button 
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={async () => {
                  try {
                    // Get token from cookies instead of localStorage
                    const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('jwtToken='))
                    ?.split('=')[1];
                    await axios.put(
                      `http://localhost:6969/order/${order._id}/cancel`,
                      {},
                      { headers: { 'x-auth-token': token } }
                    );
                    setOrder({ ...order, status: 'Cancelled' });
                  } catch (err) {
                    alert('Failed to cancel order');
                  }
                }}
              >
                Cancel Order
              </button>
            </div>
          )}

          {order.status === 'Cancelled' && (
            <div className="mt-6">
              <button 
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to remove this order from your history?')) {
                    try {
                      const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('jwtToken='))
                        ?.split('=')[1];
                        
                      await axios.delete(
                        `http://localhost:6969/order/${order._id}`,
                        { headers: { 'x-auth-token': token } }
                      );
                      
                      navigate('/orders'); // Redirect back to order list
                    } catch (err) {
                      console.error('Error removing order:', err);
                      alert('Failed to remove order');
                    }
                  }
                }}
              >
                Remove from History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;