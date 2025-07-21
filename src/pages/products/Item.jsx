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
  const [showMandatModal, setShowMandatModal] = useState(false);
  const [percentage, setPercentage] = useState(10);
  const [description, setDescription] = useState('');
  const [mandatLoading, setMandatLoading] = useState(false);
  const [mandatError, setMandatError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(`http://localhost:4000/api/product/${id}`);
        setProduct(productRes.data.product);
        
        if (productRes.data.product.sizes.length > 0) {
          setSelectedSize(productRes.data.product.sizes[0]);
        }

        const producerRes = await axios.get(
          `http://localhost:4000/api/producteur/data/${productRes.data.product.userId}`
        );
        setProducer(producerRes.data);

        const imageRes = await axios.get(
          'http://localhost:4000/api/user/userdata',
          { userId: productRes.data.product.userId }
        );
        setProducerImage(imageRes.data.image);

      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCreateMandat = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    if (!percentage || percentage <= 0 || percentage > 100) {
      setMandatError('الرجاء إدخال نسبة صحيحة بين 1 و 100');
      return;
    }

    if (!description.trim()) {
      setMandatError('الرجاء إدخال وصف');
      return;
    }

    setMandatLoading(true);
    setMandatError('');

    try {
      const response = await axios.post(
        'http://localhost:4000/api/mandat/mandats',
        {
          VendeurID: userData.userId,
          PRODUCTEURid: product.userId,
          Productid: product._id,
          Percentage: percentage,
          Description: description
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        alert('تم إنشاء الوكالة بنجاح!');
        setShowMandatModal(false);
      }
    } catch (error) {
      console.error('خطأ في إنشاء الوكالة:', error);
      setMandatError(error.response?.data?.message || 'فشل في إنشاء الوكالة');
    } finally {
      setMandatLoading(false);
    }
  };

  const handleCartAction = async (isUpdate = false) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert('الرجاء اختيار مقاس');
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
        alert(`${product.name} (${selectedSize}) ${isUpdate ? 'تم تحديث' : 'تم إضافة'} إلى السلة!`);
        getUserData();
      }
    } catch (error) {
      console.error('خطأ في السلة:', error);
      alert(error.response?.data?.message || 'فشلت عملية السلة');
    }
  };

  const isInCart = userData?.cartData?.[product?._id]?.[selectedSize];
  const currentCartQuantity = isInCart || 0;

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-12">
      <h2 className="text-xl text-gray-600">المنتج غير موجود</h2>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* نافذة الوكالة */}
      {showMandatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <h2 className="text-2xl font-bold">إنشاء وكالة</h2>
              <p className="opacity-90">لـ {product.name}</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النسبة المئوية (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-gray-400">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="صف شروط هذه الوكالة..."
                />
              </div>
              
              {mandatError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {mandatError}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowMandatModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateMandat}
                  disabled={mandatLoading}
                  className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    mandatLoading ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {mandatLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإنشاء...
                    </>
                  ) : 'إنشاء وكالة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* قسم صورة المنتج */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden aspect-square">
            <img 
              src={product.image[0].url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* قسم معلومات المنتج */}
        <div className="lg:w-1/2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-3 flex items-center">
              <span className="text-blue-600 text-2xl font-bold">د.ت {product.price}</span>
              {product.originalPrice && (
                <span className="ml-3 text-gray-400 line-through text-lg">د.ت {product.originalPrice}</span>
              )}
            </div>
          </div>

          {/* الوصف */}
          <div className="py-4">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* معلومات المنتج */}
          {producer && (
            <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-xl border border-blue-100">
              {producerImage && (
                <img 
                  src={producerImage} 
                  alt="المنتج" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{producer.nometprenomlegal}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src={tunisianFlag} 
                    alt="العلم التونسي" 
                    className="w-4 h-4 rounded-sm object-cover"
                  />
                  <p className="text-sm text-gray-600">{producer.numeroPhone}</p>
                </div>
              </div>
            </div>
          )}

          {/* اختيار المقاس */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">المقاس</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار الكمية */}
          <div className="flex items-center space-x-5">
            <h3 className="text-sm font-medium text-gray-700">الكمية</h3>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                -
              </button>
              <span className="px-5 py-2 border-x border-gray-200 font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleCartAction(isInCart)}
              className={`w-full py-3.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isInCart 
                  ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-md'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
              }`}
            >
              {isInCart ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  تحديث السلة ({currentCartQuantity} → {quantity})
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  إضافة إلى السلة
                </>
              )}
            </button>

            {userData && (
              <button
                onClick={() => setShowMandatModal(true)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                إنشاء وكالة
              </button>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-6 border-t border-gray-100">
            <div>
              <p className="text-gray-500">الفئة</p>
              <p className="font-medium text-gray-700">{product.category}</p>
            </div>
            <div>
              <p className="text-gray-500">الفئة الفرعية</p>
              <p className="font-medium text-gray-700">{product.subCategory}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;