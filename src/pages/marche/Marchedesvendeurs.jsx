import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Market = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:4000/api/marche/');
        setMarkets(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        setError('فشل في تحميل بيانات الأسواق');
        toast.error('فشل في تحميل بيانات الأسواق');
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const fetchProducts = async (marcheId) => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/product/');
      const filteredProducts = response.data.products.filter(
        (product) => product.marcheID === marcheId
      );
      setProducts(filteredProducts);
      setProductsLoading(false);
    } catch (err) {
      setProductsError('فشل في تحميل المنتجات');
      toast.error('فشل في تحميل المنتجات');
      setProductsLoading(false);
    }
  };

  const handleCardClick = (marcheId) => {
    setSelectedMarketId(marcheId);
    fetchProducts(marcheId);
  };

  const closeModal = () => {
    setSelectedMarketId(null);
    setProducts([]);
  };

  const cardStyle = "bg-white shadow-lg rounded-xl p-6 border border-blue-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer";
  const labelStyle = "text-gray-600 mb-1";
  const valueStyle = "text-blue-800 font-medium";
  const modalStyle = "bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto";

  if (loading) return <div className="text-center text-blue-600">جارٍ التحميل...</div>;
  if (error) return <div className="text-center text-red-600">خطأ: {error}</div>;

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Regulatory Information Card */}
          <div className="bg-blue-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">اللوائح القانونية</h2>
            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
              * فصل عدد 6 : يمنع تجميع ونقل وخزن المنتجات الفلاحية والصيد دون الحصول على الصفة
            </p>
          </div>

          {/* Markets Section */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">الأسواق</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {markets.map((market) => (
                <div
                  key={market._id}
                  className={cardStyle}
                  onClick={() => handleCardClick(market._id)}
                >
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">{market.nomComplet}</h2>
                  <p className={labelStyle}><span className={valueStyle}>المدينة:</span> {market.cité}</p>
                  <p className={labelStyle}><span className={valueStyle}>نوع السوق:</span> {market.typeDeMarche}</p>
                  <p className={labelStyle}><span className={valueStyle}>فئة السوق:</span> {market.categorieMarche}</p>
                  <p className={labelStyle}><span className={valueStyle}>يوم الراحة:</span> {market.jourCongé}</p>
                  <p className={labelStyle}>
                    <span className={valueStyle}>فترة العمل:</span>{' '}
                    {market.periodeDeTravail[0]?.dateDebut || 'غير متوفر'} إلى {market.periodeDeTravail[0]?.dateFin || 'غير متوفر'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedMarketId && (
          <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className={modalStyle}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-900">المنتجات</h2>
                <button
                  onClick={closeModal}
                  className="text-blue-600 hover:text-blue-800 text-2xl font-semibold focus:outline-none"
                  aria-label="إغلاق النافذة"
                >
                  ×
                </button>
              </div>
              {productsLoading && <div className="text-center text-blue-600">جارٍ تحميل المنتجات...</div>}
              {productsError && <div className="text-center text-red-600">خطأ: {productsError}</div>}
              {!productsLoading && !productsError && products.length === 0 && (
                <div className="text-center text-blue-600">لا توجد منتجات لهذا السوق.</div>
              )}
              {!productsLoading && !productsError && products.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="border border-blue-200 rounded-lg p-4 flex items-center"
                    >
                      {product.image && product.image[0]?.url && (
                        <img
                          src={product.image[0].url}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded mr-4"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">{product.name}</h3>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-gray-600"><span className={valueStyle}>السعر:</span> {product.price}</p>
                        <p className="text-gray-600"><span className={valueStyle}>الفئة:</span> {product.category}</p>
                        <p className="text-gray-600"><span className={valueStyle}>الفئة الفرعية:</span> {product.subCategory}</p>
                        <p className="text-gray-600"><span className={valueStyle}>الأحجام:</span> {product.sizes.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;