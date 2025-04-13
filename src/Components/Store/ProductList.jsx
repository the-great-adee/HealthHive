import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';

const ProductList = ({ category = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://localhost:6969/product';
        if (category) {
          url += `?category=${category}`;
        }
        
        const res = await axios.get(url);
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default ProductList;