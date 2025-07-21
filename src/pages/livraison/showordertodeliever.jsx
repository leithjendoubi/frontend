import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const ShowOrderToDeliver = () => {
  const { userData } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerInputs, setOfferInputs] = useState({});
  const [priceInputs, setPriceInputs] = useState({});
  const [offerErrors, setOfferErrors] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // جلب الطلبات
        const ordersResponse = await axios.get('http://localhost:4000/api/order/waiting-livreur');
        const ordersData = ordersResponse.data;

        // جلب تفاصيل المنتجات لكل طلب
        const productPromises = ordersData.flatMap(order =>
          order.items.map(item =>
            axios.get(`http://localhost:4000/api/product/${item.productId}`)
              .then(res => ({ id: item.productId, data: res.data.product }))
        ));
        const productResults = await Promise.all(productPromises);
        const productMap = productResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});

        // جلب بيانات المستخدمين لكل طلب
        const userPromises = [...new Set(ordersData.map(order => order.userId))].map(userId =>
          axios.post('http://localhost:4000/api/user/userdata', { userId })
            .then(res => ({ id: userId, data: res.data.userData }))
        );
        const userResults = await Promise.all(userPromises);
        const userMap = userResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});

        setOrders(ordersData);
        setProducts(productMap);
        setUsers(userMap);
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setError('فشل في جلب البيانات. يرجى المحاولة مرة أخرى لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAddOfferClick = (orderId) => {
    setOfferInputs(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    setOfferErrors(prev => ({ ...prev, [orderId]: null }));
  };

  const handlePriceChange = (orderId, value) => {
    setPriceInputs(prev => ({ ...prev, [orderId]: value }));
  };

  const handleSubmitOffer = async (orderId) => {
    if (!userData?.userId) {
      setOfferErrors(prev => ({ ...prev, [orderId]: 'يرجى تسجيل الدخول لتقديم عرض' }));
      return;
    }

    const pricepardinar = priceInputs[orderId];
    if (!pricepardinar || isNaN(pricepardinar) || pricepardinar <= 0) {
      setOfferErrors(prev => ({ ...prev, [orderId]: 'يرجى إدخال سعر صحيح (أكبر من 0)' }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/offre/offres', {
        userId: userData.userId,
        typeoffre: 'livraison',
        pricepardinar: parseFloat(pricepardinar),
        ordreId: orderId,
      });

      if (response.data.success) {
        setOfferInputs(prev => ({ ...prev, [orderId]: false }));
        setPriceInputs(prev => ({ ...prev, [orderId]: '' }));
        setOfferErrors(prev => ({ ...prev, [orderId]: null }));
        alert('تم تقديم العرض بنجاح!');
      } else {
        setOfferErrors(prev => ({ ...prev, [orderId]: response.data.message || 'فشل في تقديم العرض' }));
      }
    } catch (error) {
      console.error('خطأ في تقديم العرض:', error);
      setOfferErrors(prev => ({ 
        ...prev, 
        [orderId]: error.response?.data?.message || 'حدث خطأ أثناء تقديم عرضك' 
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">جاري تحميل الطلبات المتاحة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50 text-blue-600">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">طلبات التوصيل المتاحة</h1>
            <p className="text-blue-600 mt-1">{orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'} في انتظار التوصيل</p>
          </div>
          {userData?.userId && (
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100">
              <span className="text-blue-600 font-medium">شريك توصيل</span>
            </div>
          )}
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m5-17H7a2 2 0 0 0-2 2v1.84a4 4 0 0 0 .72 2.28l.6.84A4 4 0 0 1 8 10.92V12h8v-1.08a4 4 0 0 1 1.68-3.16l.6-.84A4 4 0 0 0 19 3.84V2a2 2 0 0 0-2-2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-blue-800 mb-2">لا توجد طلبات متاحة</h3>
            <p className="text-blue-500">لا توجد حالياً أي طلبات في انتظار التوصيل</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map(order => {
              const totalWeight = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const user = users[order.userId];

              return (
                <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100 transform hover:-translate-y-1">
                  {/* شريط أزرق علوي */}
                  <div className="bg-blue-600 h-2 w-full"></div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-white shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-4 border-4 border-white shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-blue-900">
                          الطلب رقم #{order._id.slice(-6).toUpperCase()}
                        </h2>
                        <p className="text-blue-500">{user?.name || 'عميل'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-blue-700">المبلغ:</span>
                          <span className="font-semibold text-blue-900">{order.amount} د.ت</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-700">الوزن الكلي:</span>
                          <span className="font-semibold text-blue-900">{totalWeight} كغ</span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-700 mb-1">عنوان التوصيل:</p>
                        <p className="text-blue-900">{order.address}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-bold text-blue-800 mb-3">عناصر الطلب</h3>
                      <ul className="space-y-2">
                        {order.items.map(item => (
                          <li key={item.productId} className="flex justify-between items-center py-2 px-3 hover:bg-blue-50 rounded">
                            <div>
                              <span className="font-medium text-blue-900">
                                {products[item.productId]?.name || item.name}
                              </span>
                              <span className="text-blue-500 text-xs ml-2">({item.size})</span>
                            </div>
                            <span className="text-blue-900 font-medium">
                              {item.quantity} × {products[item.productId]?.price || item.price} د.ت
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      {!offerInputs[order._id] ? (
                        <button
                          onClick={() => handleAddOfferClick(order._id)}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow hover:shadow-md ${
                            userData?.userId 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!userData?.userId}
                        >
                          {userData?.userId ? 'تقديم عرض توصيل' : 'سجل الدخول لتقديم عرض'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <input
                              type="number"
                              placeholder="أدخل سعرك (د.ت)"
                              value={priceInputs[order._id] || ''}
                              onChange={(e) => handlePriceChange(order._id, e.target.value)}
                              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              step="0.01"
                            />
                            {offerErrors[order._id] && (
                              <p className="text-red-500 text-sm mt-1">{offerErrors[order._id]}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleAddOfferClick(order._id)}
                              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300 shadow hover:shadow-md"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleSubmitOffer(order._id)}
                              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300 shadow hover:shadow-md"
                            >
                              تقديم العرض
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowOrderToDeliver;