import React from 'react';
import OrderHistory from '../Components/Store/OrderHistory';
import OrderDetail from '../Components/Store/OrderDetail';
import { useParams } from 'react-router-dom';

const OrdersPage = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-gray-50">
      {/* pt-16 = padding top to offset fixed navbar height (adjust as needed) */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          {id ? <OrderDetail /> : <OrderHistory />}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
