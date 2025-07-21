import { useEffect, useState } from 'react';

const VendeurList = () => {
  const [vendeurs, setVendeurs] = useState([]);
  const [userDataMap, setUserDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendeurs = async () => {
      try {
        // جلب بيانات البائعين
        const response = await fetch('http://localhost:4000/api/vendeur/demandsaccepted');
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات البائعين');
        }
        const data = await response.json();
        
        if (data) {
          setVendeurs(data);
          
          // جلب بيانات المستخدم لكل بائع
          const userDataPromises = data.map(async (vendeur) => {
            try {
              const userResponse = await fetch(
                `http://localhost:4000/api/user/userdata/${vendeur.userId}`
              );
              
              if (!userResponse.ok) {
                console.error(`فشل في جلب بيانات المستخدم لـ: ${vendeur.userId}`);
                return null;
              }
              
              const userData = await userResponse.json();
              return userData.success ? userData.userData : null;
            } catch (err) {
              console.error(`خطأ في جلب بيانات المستخدم لـ ${vendeur.userId}:`, err);
              return null;
            }
          });

          const userDataResults = await Promise.all(userDataPromises);
          const userDataMap = {};
          
          data.forEach((vendeur, index) => {
            if (userDataResults[index]) {
              userDataMap[vendeur.userId] = userDataResults[index];
            }
          });
          
          setUserDataMap(userDataMap);
        } else {
          throw new Error('لا توجد بيانات');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendeurs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50" dir="rtl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">جاري تحميل البائعين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-50 text-blue-600" dir="rtl">
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
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">البائعون المعتمدون</h1>
          <p className="text-lg text-blue-600">قائمة جميع البائعين المقبولين في المنصة</p>
        </div>
        
        {vendeurs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-2xl font-semibold text-blue-800 mb-2">لا يوجد بائعون</h3>
            <p className="text-blue-500">لا يوجد بائعون معتمدون في النظام حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendeurs.map((vendeur) => {
              const userData = userDataMap[vendeur.userId];
              const imageUrl = userData?.image;
              
              return (
                <div key={vendeur._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100 transform hover:-translate-y-1">
                  {/* شريط أزرق علوي */}
                  <div className="bg-blue-600 h-2 w-full"></div>
                  
                  <div className="p-6">
                    {/* قسم الملف الشخصي مع الصورة والاسم */}
                    <div className="flex items-center mb-6">
                      <div className="relative">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={`${userData?.name || vendeur.nometprenomlegal || 'بائع'} صورة الملف الشخصي`}
                            className="w-20 h-20 rounded-full object-cover ml-4 border-4 border-white shadow-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 ml-4 border-4 border-white shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        {userData?.isAccountVerified && (
                          <div className="absolute bottom-0 left-4 bg-blue-600 text-white rounded-full p-1.5 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-blue-900">
                          {vendeur.nometprenomlegal || 'بائع غير معروف'}
                        </h2>
                        <p className="text-blue-500 text-sm">
                          {userData?.email || 'لا يوجد بريد إلكتروني'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-700">الهاتف:</span>
                        <span className="font-semibold text-blue-900">{vendeur.numeroPhone}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-700">العنوان:</span>
                        <span className="font-semibold text-blue-900 text-right">{vendeur.adressProfessionnel}</span>
                      </div>
                      
                      <div className="py-2 px-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-700 mb-1">الفئات:</p>
                        <div className="flex flex-wrap gap-1">
                          {vendeur.categorieProduitMarche?.map((category, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {category}
                            </span>
                          )) || <span className="text-blue-900">لا يوجد</span>}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-blue-100">
                        <span className="font-medium text-blue-700">الحالة:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vendeur.statutdemande === 'مقبول' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendeur.statutdemande}
                        </span>
                      </div>
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

export default VendeurList;