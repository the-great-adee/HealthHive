import React from 'react';
import Cart from '../Components/Store/Cart';

const CartPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Add padding top to avoid overlap with fixed Navbar (e.g., 64px if Navbar is h-16) */}
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Cart />
      </main>
    </div>
  );
};

export default CartPage;
