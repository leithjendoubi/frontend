import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const Mandat = () => {
  const { userData } = useContext(AppContext);
  const userId = userData?.userId;
  
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchMandats();
  }, [userId]);

  const fetchMandats = async () => {
    try {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      const mandatsResponse = await fetch(`http://localhost:4000/api/mandat/mandats/producer/${userId}`);
      const mandatsData = await mandatsResponse.json();
      
      if (!mandatsData.success) {
        throw new Error('فشل جلب بيانات الوكالات');
      }
      
      const enrichedMandats = await Promise.all(
        mandatsData.mandats.map(async (mandat) => {
          const vendeurResponse = await fetch(`http://localhost:4000/api/vendeur/data/${mandat.VendeurID}`);
          const vendeurData = await vendeurResponse.json();
          
          const productResponse = await fetch(`http://localhost:4000/api/product/${mandat.Productid}`);
          const productData = await productResponse.json();
          
          return {
            ...mandat,
            vendeur: {
              name: vendeurData.nometprenomlegal,
              phone: vendeurData.numeroPhone
            },
            product: productData.product
          };
        })
      );
      
      setMandats(enrichedMandats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMandatStatus = async (mandatId, newStatus) => {
    try {
      setUpdatingStatus(mandatId);
      
      const response = await fetch(`http://localhost:4000/api/mandat/mandats/status/${mandatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statutoffre: newStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'فشل تحديث حالة الوكالة');
      }

      await fetchMandats();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">جاري تحميل وكالاتك...</p>
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
            onClick={fetchMandats}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  if (mandats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
        <div className="bg-white rounded-2xl shadow-md p-12 text-center max-w-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-2xl font-semibold text-blue-800 mb-2">لا توجد وكالات</h3>
          <p className="text-blue-500">ليس لديك أي وكالات مسندة إليك حالياً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">وكالاتك</h1>
          <p className="text-blue-600">لديك {mandats.length} وكالة مسندة إليك</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mandats.map((mandat) => (
            <div key={mandat._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100 transform hover:-translate-y-1">
              {/* Status indicator bar */}
              <div className={`h-2 w-full ${
                mandat.statutoffre === 'accepté' ? 'bg-green-500' :
                mandat.statutoffre === 'refuse' ? 'bg-red-500' : 
                'bg-blue-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-blue-900">
                    {mandat.product?.name || 'وكالة منتج'}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    mandat.statutoffre === 'accepté' ? 'bg-green-100 text-green-800' :
                    mandat.statutoffre === 'refuse' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {mandat.statutoffre === 'accepté' ? 'مقبول' : 
                     mandat.statutoffre === 'refuse' ? 'مرفوض' : 
                     'قيد الانتظار'}
                  </span>
                </div>
                
                {/* Product Image */}
                {mandat.product?.image?.[0]?.url && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-blue-50">
                    <img 
                      src={mandat.product.image[0].url} 
                      alt={mandat.product.name} 
                      className="w-full h-48 object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Product Details */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">تفاصيل المنتج</h4>
                    <p className="text-blue-900 mb-1">
                      <span className="font-medium">السعر:</span> {mandat.product?.price || 'غير متوفر'} د.ت
                    </p>
                    <p className="text-blue-900 line-clamp-2">
                      <span className="font-medium">الوصف:</span> {mandat.product?.description || 'لا يوجد وصف'}
                    </p>
                  </div>
                  
                  {/* Vendeur Details */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">تفاصيل البائع</h4>
                    <p className="text-blue-900 mb-1">
                      <span className="font-medium">الاسم:</span> {mandat.vendeur?.name || 'غير متوفر'}
                    </p>
                    <p className="text-blue-900">
                      <span className="font-medium">الهاتف:</span> {mandat.vendeur?.phone || 'غير متوفر'}
                    </p>
                  </div>
                  
                  {/* Mandat Terms */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">شروط الوكالة</h4>
                    <p className="text-blue-900 mb-1">
                      <span className="font-medium arabic-text">النسبة المئوية:</span> {mandat.Percentage}%
                    </p>
                    <p className="text-blue-900">
                      <span className="font-medium  arabic-text  ">الاتفاقية:</span> {mandat.Description || 'لا توجد شروط إضافية'}
                    </p>
                  </div>
                  
                  {/* Actions for waiting mandats */}
                  {mandat.statutoffre === 'waiting' && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => updateMandatStatus(mandat._id, 'accepté')}
                        disabled={updatingStatus === mandat._id}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          updatingStatus === mandat._id 
                            ? 'bg-blue-300 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {updatingStatus === mandat._id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري المعالجة
                          </span>
                        ) : 'قبول'}
                      </button>
                      <button
                        onClick={() => updateMandatStatus(mandat._id, 'refuse')}
                        disabled={updatingStatus === mandat._id}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          updatingStatus === mandat._id 
                            ? 'bg-blue-300 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mandat;