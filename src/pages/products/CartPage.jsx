import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const CartPage = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartResponse = await axios.post(
          'http://localhost:4000/api/cart/get',
          { userId: userData.userId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        const cartData = cartResponse.data.cartData;
        setCartItems(cartData);

        const productIds = Object.keys(cartData);
        const productPromises = productIds.map(async (productId) => {
          try {
            const response = await axios.get(`http://localhost:4000/api/product/${productId}`);
            return response.data.product;
          } catch (err) {
            console.error(`فشل جلب المنتج ${productId}:`, err);
            return null;
          }
        });

        const productResults = await Promise.all(productPromises);
        const productMap = {};
        productResults.forEach((product, index) => {
          if (product) {
            productMap[productIds[index]] = product;
          }
        });

        setProducts(productMap);
        setLoading(false);
      } catch (error) {
        console.error('خطأ في جلب سلة التسوق:', error);
        setError(error.response?.data?.message || 'فشل تحميل سلة التسوق');
        setLoading(false);
      }
    };

    if (userData) fetchCart();
  }, [userData, navigate]);

  const calculateTotal = () => {
    let total = 0;
    Object.entries(cartItems).forEach(([productId, sizes]) => {
      Object.entries(sizes).forEach(([size, quantity]) => {
        if (products[productId]) {
          total += products[productId].price * quantity;
        }
      });
    });
    return total.toFixed(2);
  };

  const handleDeleteItem = async (productId, size) => {
    if (!window.confirm('هل أنت متأكد أنك تريد إزالة هذا العنصر من سلة التسوق؟')) return;

    try {
      const response = await axios.post(
        'http://localhost:4000/api/cart/delete',
        {
          userId: userData.userId,
          itemId: productId,
          size,
          removeCompletely: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        const updatedCartItems = { ...cartItems };
        delete updatedCartItems[productId][size];
        if (Object.keys(updatedCartItems[productId]).length === 0) {
          delete updatedCartItems[productId];
        }
        setCartItems(updatedCartItems);
      }
    } catch (error) {
      console.error('خطأ في حذف العنصر:', error);
      alert(error.response?.data?.message || 'فشل إزالة العنصر من سلة التسوق');
    }
  };

  if (loading) return <div className="text-center py-10 text-blue-500">جاري تحميل سلة التسوق...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-4xl font-bold text-blue-700 mb-10">سلة التسوق الخاصة بك</h1>

      {Object.keys(cartItems).length === 0 ? (
        <div className="text-center bg-blue-50 py-16 rounded-xl shadow-sm border border-blue-100">
          <p className="text-xl text-blue-700 mb-6">سلة التسوق الخاصة بك فارغة حالياً.</p>
          <button
            onClick={() => navigate('/marche')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            تصفح المنتجات
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {Object.entries(cartItems).map(([productId, sizes]) => {
              const product = products[productId];
              if (!product) return null;

              return (
                <div key={productId} className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition duration-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                      <img
                        src={product.image[0].url}
                        alt={product.name}
                        className="w-full h-auto rounded-lg object-cover aspect-square border border-gray-100"
                      />
                    </div>
                    <div className="md:w-3/4">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-2xl font-semibold text-blue-800">{product.name}</h2>
                        <span className="text-lg font-bold text-blue-600">د.ت {product.price}</span>
                      </div>
                      <p className="text-gray-600 mb-5">{product.description}</p>

                      <div className="mb-4">
                        <h3 className="font-medium text-blue-600 mb-3">المقاسات والكميات</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(sizes).map(([size, quantity]) => (
                            <div
                              key={`${productId}-${size}`}
                              className="flex justify-between items-center bg-blue-50 p-3 rounded-lg group hover:bg-blue-100 transition duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-blue-800 bg-white px-2 py-1 rounded">المقاس: {size}</span>
                                <span className="text-sm text-gray-700">الكمية: {quantity}</span>
                                <span className="text-sm font-semibold text-blue-600">
                                  د.ت {(product.price * quantity).toFixed(2)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(productId, size)}
                                className="p-1 text-blue-400 hover:text-red-500 transition duration-200 group-hover:opacity-100"
                                title="إزالة العنصر"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-800">ملخص الطلب</h3>
              <span className="text-2xl font-bold text-blue-700">د.ت {calculateTotal()}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => navigate('/marche')}
                className="px-6 py-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition duration-200"
              >
                متابعة التسوق
              </button>
              <button
                onClick={() => navigate('/addorder')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                المتابعة إلى الدفع
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;