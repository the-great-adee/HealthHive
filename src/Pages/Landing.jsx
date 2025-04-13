import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Landing = () => {
    const navigator = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    function getJwtToken() {
        const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === 'jwtToken') {
                return value;
            }
        }
        return null;
    }
    
    const jwtToken = getJwtToken();
    const isDoctor = localStorage.getItem('isDoctor');

    useEffect(() => {
        if (jwtToken) {
            if (isDoctor === 'true') {
                navigator('/doctor-dashboard');
            } else {
                navigator('/patient-dashboard');
            }
        }
        
        // Fetch featured products for the landing page
        const fetchFeaturedProducts = async () => {
            try {
                const res = await axios.get('http://localhost:6969/product/featured');
                setFeaturedProducts(res.data.slice(0, 4)); // Limit to 4 featured products
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch featured products", err);
                setLoading(false);
            }
        };
        
        fetchFeaturedProducts();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div>
                <section>
                    <section className='sticky py-16'>
                        <div className='max-w-lg px-4 sm:pt-16 pt-8 sm:pb-6 mx-auto text-left md:max-w-none md:text-center'>
                            <h1 className='font-extrabold tracking-tight text-left text-[#201515] text-center sm:leading-none text-5xl sm:text-6xl'>
                                <span className='inline md:block'>HealthHive - Connects to</span>
                                <span className='relative mt-2 bg-clip-text text-[#201515] md:inline-block'>health vitality</span>
                            </h1>
                        </div>

                        <div className='max-w-lg px-4 pb-12 mx-auto text-left md:max-w-none md:text-center'>
                            <div className='text-center py-4'>
                                <div className='backdrop-blur-sm transition duration-500 ease-in-out bg-green-600 border border-[#E2E8F0] translate-y-1 text-white hover:text-white text-lg font-semibold py-3 px-6 rounded-3xl inline-flex items-center m-2 hover:bg-indigo-600 hover:scale-105 hover:shadow-xl'>
                                    <Link to='/doctor-login'>Log in As a Doctor</Link>
                                </div>

                                <div className='backdrop-blur-sm transition duration-500 ease-in-out bg-green-600 border border-[#E2E8F0] translate-y-1 text-white hover:text-white text-lg font-semibold py-3 px-6 rounded-3xl inline-flex items-center m-2 hover:bg-indigo-600 hover:scale-105 hover:shadow-xl'>
                                    <Link to='/patient-login'>Log in As a Patient</Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>

                {/* Featured Products Section */}
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                            <p className="mt-4 text-lg text-gray-600">Browse our selection of top healthcare products</p>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center mt-8">
                                <p>Loading products...</p>
                            </div>
                        ) : (
                            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {featuredProducts.map(product => (
                                    <div key={product._id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="w-full h-48 object-cover object-center"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                            <p className="mt-1 text-gray-500">{product.manufacturer}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                                                <Link 
                                                    to={`/product/${product._id}`}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-10 text-center">
                            <Link 
                                to="/store" 
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                                View All Products
                                <svg className="ml-2 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className='text-left'>
                    <div className='sm:px-28'>
                        <section className='relative flex items-center w-full'>
                            <div className='relative items-center w-full px-5 mx-auto md:px-12 lg:px-16 max-w-7xl'>
                                <div className='relative flex-col items-start m-auto align-middle'>
                                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24'>
                                        <div className='relative items-center gap-12 m-auto lg:inline-flex md:order-first'>
                                            <div className='max-w-xl text-center lg:text-left'>
                                                <div>
                                                    <p className='text-3xl font-semibold tracking-tight text-[#201515] sm:text-5xl'>Wellness, Now at Your Doorstep.</p>
                                                    <p className='max-w-xl mt-4 text-base tracking-tight text-gray-600'>At HealthHive, we prioritize your well-being with a seamless online platform for prescriptions, OTC medications, and health consultations. Experience secure ordering, same-day delivery, and personalized care—all from the comfort of home.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='m-auto order-first block w-4/5 mt-12 aspect-square lg:mt-0'>
                                            <img className='object-cover rounded-3xl object-center w-full mx-auto lg:ml-auto' alt='hero' src='./logo.png' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Landing;