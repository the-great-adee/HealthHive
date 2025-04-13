import React from 'react';
import ProductList from '../Components/Store/ProductList';

const Store = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-semibold text-gray-800">Medical Store</h1>
          <p className="text-lg text-gray-600 mt-2">
            Explore trusted prescription medicines and healthcare essentials
          </p>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ProductList />
        </div>
      </main>
    </div>
  );
};

export default Store;
