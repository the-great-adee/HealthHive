import React from 'react';
import ProductDetail from '../Components/Store/ProductDetail';


const ProductDetails = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <ProductDetail />
      </main>
    </div>
  );
};

export default ProductDetails;