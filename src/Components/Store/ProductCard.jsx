import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.manufacturer}</p>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-bold">&#8377;{product.price.toFixed(2)}</span>
          <button 
            onClick={() => navigate(`/store/product/${product._id}`)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
        {product.requiresPrescription && (
          <div className="mt-2 text-xs text-red-500 font-medium">
            Prescription Required
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;