import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import tunisianFlag from '../../assets/tunisianflag.jpg';

const Item = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, getUserData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [producer, setProducer] = useState(null);
  const [producerImage, setProducerImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch product data
        const productRes = await axios.get(`http://localhost:4000/api/product/${id}`);
        setProduct(productRes.data.product);
        
        // Set default size if available
        if (productRes.data.product.sizes.length > 0) {
          setSelectedSize(productRes.data.product.sizes[0]);
        }

        // 2. Fetch producer data
        const producerRes = await axios.get(
          `http://localhost:4000/api/producteur/data/${productRes.data.product.userId}`
        );
        setProducer(producerRes.data);

        // 3. Fetch producer image (using POST with body)
        const imageRes = await axios.get(
          'http://localhost:4000/api/user/userdata',
          { userId: productRes.data.product.userId }
        );
        setProducerImage(imageRes.data.image);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCartAction = async (isUpdate = false) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    try {
      const endpoint = isUpdate ? '/api/cart/update' : '/api/cart/add';
      const method = isUpdate ? 'put' : 'post';

      const response = await axios[method](
        `http://localhost:4000${endpoint}`,
        {
          userId: userData.userId,
          itemId: product._id,
          size: selectedSize,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        alert(`${product.name} (${selectedSize}) ${isUpdate ? 'updated' : 'added'} to cart!`);
        getUserData();
      }
    } catch (error) {
      console.error('Cart error:', error);
      alert(error.response?.data?.message || 'Cart operation failed');
    }
  };

  const isInCart = userData?.cartData?.[product?._id]?.[selectedSize];
  const currentCartQuantity = isInCart || 0;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-12">
      <h2 className="text-xl text-gray-600">Product not found</h2>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image Section */}
        <div className="md:w-1/2 bg-white rounded-xl shadow-sm overflow-hidden">
          <img 
            src={product.image[0].url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info Section */}
        <div className="md:w-1/2 space-y-6">
          {/* Product Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-blue-600 text-2xl font-medium mt-2">DT {product.price}</p>
          </div>

          {/* Description */}
          <div className="border-t border-b border-gray-100 py-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Producer Information */}
          {producer && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              {producerImage && (
                <img 
                  src={producerImage} 
                  alt="Producer" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{producer.nometprenomlegal}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src={tunisianFlag} 
                    alt="Tunisian Flag" 
                    className="w-4 h-4 rounded-sm object-cover"
                  />
                  <p className="text-sm text-gray-600">{producer.numeroPhone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Size</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add/Update Cart Button */}
          <button
            onClick={() => handleCartAction(isInCart)}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              isInCart 
                ? 'bg-blue-700 hover:bg-blue-800 text-white'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
            }`}
          >
            {isInCart ? `Update Cart (${currentCartQuantity} → ${quantity})` : 'Add to Cart'}
          </button>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Subcategory</p>
              <p className="font-medium">{product.subCategory}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;