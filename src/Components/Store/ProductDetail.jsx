import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // At the beginning of your component or in useEffect
useEffect(() => {
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token starts with:', token.substring(0, 10) + '...');
  }
}, []);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:6969/product/${id}`);
        setProduct(res.data);
        
        if (res.data.requiresPrescription) {
          // Fetch user's prescriptions
          const token = localStorage.getItem('token');
          const prescriptionRes = await axios.get('http://localhost:6969/prescription', {
            headers: { 'x-auth-token': token }
          });
          setUserPrescriptions(prescriptionRes.data.filter(p => p.status === 'active'));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Get token from cookies instead of localStorage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwtToken='))
        ?.split('=')[1];
      
      // Check if token exists
      if (!token) {
        setMessage({ text: 'Please login to add items to cart', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        return;
      }
      
      const data = {
        productId: product._id,
        quantity
      };
      
      if (product.requiresPrescription && selectedPrescription) {
        data.prescriptionId = selectedPrescription;
      }
      
      await axios.post('http://localhost:6969/cart/add', data, {
        headers: { 'x-auth-token': token }
      });
      
      setMessage({ text: 'Product added to cart!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data || err.message);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to add to cart', 
        type: 'error' 
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading product details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 pt-28">
      <button 
        onClick={() => navigate('/store')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Store
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-600 mb-2">{product.manufacturer}</p>
          
          <div className="mb-4">
            <span className="text-xl font-bold text-blue-600">&#8377;{product.price.toFixed(2)}</span>
            <span className="ml-2 text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {product.activeIngredients?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Active Ingredients:</h3>
              <ul className="list-disc pl-5">
                {product.activeIngredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          
          {product.dosage && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Dosage:</h3>
              <p className="text-gray-700">{product.dosage}</p>
            </div>
          )}
          
          {product.requiresPrescription && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">This product requires a valid prescription</p>
              
              {userPrescriptions.length > 0 ? (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select a prescription:
                  </label>
                  <select
                    value={selectedPrescription}
                    onChange={(e) => setSelectedPrescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">-- Select a prescription --</option>
                    {userPrescriptions.map(prescription => (
                      <option key={prescription._id} value={prescription._id}>
                        {prescription.doctorEmail} - {new Date(prescription.issueDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  You don't have any active prescriptions. Please consult a doctor.
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center mb-6">
            <label className="mr-4 font-medium">Quantity:</label>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border-r border-gray-300"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 text-center"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1 border-l border-gray-300"
              >
                +
              </button>
            </div>
          </div>
          
          {message.text && (
            <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0 || (product.requiresPrescription && !selectedPrescription)}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              product.stock === 0 || (product.requiresPrescription && !selectedPrescription)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;