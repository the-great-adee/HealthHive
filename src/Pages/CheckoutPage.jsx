import React from 'react';
import Checkout from '../Components/Store/Checkout';

const CheckoutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Checkout />
      </main>
    </div>
  );
};

export default CheckoutPage;
