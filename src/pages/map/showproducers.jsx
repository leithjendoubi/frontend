import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// إصلاح لأيقونات العلامات الافتراضية
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Showproducer = () => {
  const [products, setProducts] = useState([]);
  const [producersData, setProducersData] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/product/');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
          // استخراج الفئات الفرعية الفريدة
          const uniqueSubCategories = [...new Set(data.products.map(p => p.subCategory))];
          setSubCategories(uniqueSubCategories);
        } else {
          throw new Error('فشل في جلب المنتجات');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedSubCategory) {
      const fetchProducersData = async () => {
        setLoading(true);
        try {
          // تصفية المنتجات حسب الفئة الفرعية المحددة
          const filteredProducts = products.filter(p => p.subCategory === selectedSubCategory);
          
          // جلب الإحداثيات وتفاصيل المنتج لكل منتج
          const producersWithDetails = await Promise.all(
            filteredProducts.map(async (product) => {
              try {
                // جلب الإحداثيات
                const coordsResponse = await fetch(`http://localhost:4000/api/map/user/${product.userId}`);
                const coordsData = await coordsResponse.json();
                
                // جلب تفاصيل المنتج
                const producerResponse = await fetch(`http://localhost:4000/api/producteur/data/${product.userId}`);
                const producerData = await producerResponse.json();
                
                return {
                  ...product,
                  coordinates: coordsData.coordinates,
                  producerInfo: {
                    name: producerData.nometprenomlegal,
                    phone: producerData.numeroPhone,
                    address: producerData.adressProfessionnel,
                    type: producerData.typeDesProducteurs
                  }
                };
              } catch (err) {
                console.error(`فشل في جلب البيانات للمستخدم ${product.userId}:`, err);
                return null;
              }
            })
          );
          
          // تصفية القيم الفارغة (عمليات الجلب الفاشلة)
          const validProducers = producersWithDetails.filter(p => p !== null && p.coordinates);
          setProducersData(validProducers);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProducersData();
    }
  }, [selectedSubCategory, products]);

  if (loading && !selectedSubCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="animate-pulse flex justify-center">
            <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-navy-700">جاري تحميل المنتجات...</h2>
          <p className="text-blue-600 mt-2">جاري اكتشاف المنتجين التونسيين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full border-l-4 border-red-500">
          <h2 className="text-xl font-semibold text-navy-700 mb-2">خطأ</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-navy-700 mb-2">اكتشف المنتجين التونسيين</h1>
              <p className="text-blue-600 mb-6">ابحث عن المنتجين المحليين في جميع أنحاء تونس</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              تونس
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="subCategory" className="block text-sm font-medium text-navy-700 mb-2">
              اختر فئة المنتج
            </label>
            <div className="relative">
              <select
                id="subCategory"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="block appearance-none w-full md:w-1/3 bg-white border border-blue-200 text-navy-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- اختر فئة --</option>
                {subCategories.map((category) => (
                  <option key={category} value={category} className="text-navy-700">
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {selectedSubCategory && (
            <div className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="ml-4 text-blue-600">جاري تحميل المنتجين التونسيين...</p>
                </div>
              ) : producersData.length === 0 ? (
                <div className="text-center py-8 bg-blue-50 rounded-lg">
                  <p className="text-navy-700">لا توجد منتجات في هذه الفئة في تونس.</p>
                </div>
              ) : (
                <div className="h-[500px] w-full rounded-xl overflow-hidden border border-blue-200 shadow-sm">
                  <MapContainer
                    center={[34.1199, 9.5400]} // مركز تونس (تقريبًا قابس)
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-xl"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {producersData.map((producer) => (
                      producer.coordinates && (
                        <Marker
                          key={producer._id}
                          position={producer.coordinates}
                        >
                          <Popup className="rounded-lg">
                            <div className="min-w-[250px] p-3">
                              <h3 className="font-bold text-lg text-navy-700 mb-2 border-b border-blue-100 pb-2">
                                {producer.name}
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-blue-600 text-sm">المنتج:</p>
                                  <p className="text-navy-700">{producer.producerInfo?.name || 'غير متوفر'}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-600 text-sm">الهاتف:</p>
                                  <p className="text-navy-700">{producer.producerInfo?.phone || 'غير متوفر'}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="font-semibold text-blue-600 text-sm">تفاصيل المنتج:</p>
                                  <p className="text-navy-700">{producer.description}</p>
                                  <p className="text-navy-700 mt-1">السعر: <span className="font-semibold">{producer.price} دينار تونسي</span></p>
                                  <p className="text-navy-700">متوفر: {producer.availablepoids.join(', ')} {producer.sizes.join(', ')}</p>
                                </div>
                                {producer.image?.length > 0 && (
                                  <img 
                                    src={producer.image[0].url} 
                                    alt={producer.name} 
                                    className="w-full h-32 object-cover mt-2 rounded-lg border border-blue-200"
                                  />
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Showproducer;