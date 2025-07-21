import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const ToDeliver = () => {
  const { userData  } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/order/orders/68775a234813708947c0173b', {
          headers: {
            'Content-Type': 'application/json',
            'userId': userData.userId
          }
        });
        
        if (!response.ok) {
          throw new Error('فشل جلب الطلبات');
        }
        
        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userData.userId]);

  const handleDeliveryStarted = (orderId) => {
    console.log(`بدأ التوصيل للطلب ${orderId}`);
    // أضف منطق بدء التوصيل هنا
  };

  const handleDeliverySuccess = (orderId) => {
    console.log(`تم التوصيل بنجاح للطلب ${orderId}`);
    // أضف منطق نجاح التوصيل هنا
  };

  const handleDeliveryFailed = (orderId) => {
    console.log(`فشل التوصيل للطلب ${orderId}`);
    // أضف منطق فشل التوصيل هنا
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">جاري تحميل طلبات التوصيل...</p>
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
            <h1 className="text-3xl font-extrabold text-blue-900">طلبات للتوصيل</h1>
            <p className="text-blue-600 mt-1">
              {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'} مخصصة لك
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100">
            <span className="text-blue-600 font-medium">موصل</span>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m5-17H7a2 2 0 0 0-2 2v1.84a4 4 0 0 0 .72 2.28l.6.84A4 4 0 0 1 8 10.92V12h8v-1.08a4 4 0 0 1 1.68-3.16l.6-.84A4 4 0 0 0 19 3.84V2a2 2 0 0 0-2-2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-blue-800 mb-2">لا توجد طلبات مخصصة</h3>
            <p className="text-blue-500">لا توجد حالياً أي طلبات مخصصة لك للتوصيل.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100 transform hover:-translate-y-1">
                {/* Blue header accent */}
                <div className="bg-blue-600 h-2 w-full"></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">طلب #{order._id.slice(-6).toUpperCase()}</h2>
                      <p className="text-blue-500 text-sm mt-1">
                        {new Date(order.date).toLocaleDateString('ar-EG', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Delivery Assigned' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status === 'Delivery Assigned' ? 'تم تعيين التوصيل' : order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-700 font-medium mb-1">معلومات الاتصال</p>
                      <p className="text-blue-900">{order.numeroPhone}</p>
                      <p className="text-blue-900">{order.address}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-700 font-medium mb-1">نوع التوصيل</p>
                      <p className="text-blue-900 capitalize">
                        {order.typeLivraison === 'standard' ? 'عادي' : 
                         order.typeLivraison === 'express' ? 'سريع' : 
                         order.typeLivraison}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-blue-100 pt-4 mb-6">
                    <h3 className="font-bold text-blue-800 mb-3">عناصر الطلب</h3>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center py-1 px-2 hover:bg-blue-50 rounded">
                          <div>
                            <span className="font-medium text-blue-900">{item.name}</span>
                            <span className="text-blue-500 text-xs ml-2">({item.size})</span>
                          </div>
                          <span className="text-blue-900 font-medium">
                            {item.quantity} × {item.price} د.ت
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-700">رسوم التوصيل:</p>
                      <p className="font-semibold text-blue-900">{order.amount_livraison} د.ت</p>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-100 rounded-lg">
                      <p className="font-bold text-blue-800">المبلغ الإجمالي:</p>
                      <p className="font-bold text-blue-900 text-lg">{order.amount + order.amount_livraison} د.ت</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleDeliveryStarted(order._id)}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow hover:shadow-md"
                    >
                      بدء التوصيل
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleDeliverySuccess(order._id)}
                        className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300 shadow hover:shadow-md"
                      >
                        نجاح
                      </button>
                      
                      <button
                        onClick={() => handleDeliveryFailed(order._id)}
                        className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-300 shadow hover:shadow-md"
                      >
                        فشل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToDeliver;