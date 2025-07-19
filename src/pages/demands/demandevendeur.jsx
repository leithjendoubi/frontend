import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import tunisianFlag from '../../assets/tunisianflag.jpg';
import carteInstruction from '../../assets/carteinstruction.jpeg';
import loiDescCartes from '../../assets/loidescartes.jpeg';

const DOCUMENT_TYPES = {
  BUSINESS_LICENSE: "رخصة تجارية",
  ID_CARD_COPY: "نسخة بطاقة الهوية",
  TAX_REGISTRATION: "تسجيل ضريبي",
  STORAGE_CERTIFICATE: "شهادة التخزين"
};

const DemandVendeur = () => {
  const { userData } = useContext(AppContext);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [formData, setFormData] = useState({
    numeroPhone: '',
    adressProfessionnel: '',
    categorieProduitMarche: '',
    nometprenomlegal: '',
    marcheId: '',
    adressDeStockage: '',
    typeDesVendeurs: '',
  });
  const [files, setFiles] = useState(
    Object.keys(DOCUMENT_TYPES).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVendorTypes, setIsLoadingVendorTypes] = useState(false);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  useEffect(() => {
    const fetchVendorTypes = async () => {
      setIsLoadingVendorTypes(true);
      try {
        const response = await axios.get('http://localhost:4000/api/administration/types-vendeurs');
        setVendorTypes(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error('فشل في تحميل أنواع البائعين');
      } finally {
        setIsLoadingVendorTypes(false);
      }
    };

    const fetchMarkets = async () => {
      setIsLoadingMarkets(true);
      try {
        const response = await axios.get('http://localhost:4000/api/marche/');
        setMarkets(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error('فشل في تحميل الأسواق');
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    fetchVendorTypes();
    fetchMarkets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (fileType) => (e) => {
    setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));
  };

  const validateTunisianPhone = (phone) => {
    const regex = /^\d{8}$/;
    return regex.test(phone);
  };

  const validateForm = () => {
    if (!validateTunisianPhone(formData.numeroPhone)) {
      toast.error('يرجى إدخال رقم هاتف تونسي صالح (8 أرقام)');
      return false;
    }

    const missingFields = Object.keys(formData).filter(
      key => !formData[key] && key !== 'adressDeStockage'
    );
    if (missingFields.length > 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    const missingDocuments = Object.keys(files).filter(key => !files[key]);
    if (missingDocuments.length > 0) {
      toast.error(`يرجى رفع جميع الوثائق المطلوبة: ${missingDocuments.map(d => DOCUMENT_TYPES[d]).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', userData?.userId || '');
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) formDataToSend.append(key, file);
      });

      const response = await axios.post(
        'http://localhost:4000/api/vendeur/',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('تم تقديم طلب تسجيل البائع بنجاح!');
      setFormData({
        numeroPhone: '',
        adressProfessionnel: '',
        categorieProduitMarche: '',
        nometprenomlegal: '',
        marcheId: '',
        adressDeStockage: '',
        typeDesVendeurs: ''
      });
      setFiles(
        Object.keys(DOCUMENT_TYPES).reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تقديم طلب التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "mt-1 block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 p-2.5 border text-gray-900";
  const labelStyle = "block text-sm font-medium text-blue-800 mb-1";
  const selectStyle = `${inputStyle} bg-white`;
  const fileInputStyle = "mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Regulatory Information Card */}
          <div className="bg-blue-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">اللوائح القانونية</h2>
            <div className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
              <p className="mb-2">في إطار أحكام القانون عدد 86 لتنظيم مسالك التوزيع و الإنتاج الفلاحي و الصيد البحري :</p>
              <p className="mb-2">يمنع تجميع ونقل وخزن المنتجات الفلاحية والصيد دون الحصول على الصفة</p>
              <p className="mb-2">يخولك إمتلاك صفة البائع شراء المنوجات الفلاحية بالجملة من الأسواق الإدارية (أسواق الإنتاج و الجملة )
</p>
              <p className="mb-2">يخولك لك أيضا قبول و عرض عروض تكويل بيع بالجملة</p>
              <p className="mb-2">يخولك لك أيضا الحصول على بطاقة دخول بيضاء و حمراء</p>
              <p className="mb-2">في صورة الحصول على إحدى البطاقات الرجاء الإستضهار بها في خانة الصفة</p>
              <p className="mb-2 font-semibold text-dark-blue" style={{ color: 'darkblue' }}>أنقر هنا :</p>
              <div className="space-y-2 mt-4">
                <a href={carteInstruction} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline">
                  بطاقة الإرشادات للحصول على بطاقة دخول
                </a>
                <a href={loiDescCartes} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline">
                  قانون وزارة التجارة المنظم لبطاقات الدخول
                </a>
                <a href="https://idaraty.tn/publications/jort-1994-058-b564" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline">
                  قانون عدد 86 لسنة 1994 المنظم لمسالك التوزيع المنتوجات الفلاحية و الصيد البحري
                </a>
              </div>                                        
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">تسجيل بائع</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>معرف المستخدم</label>
                  <input
                    type="text"
                    value={userData?.userId || ''}
                    readOnly
                    className={`${inputStyle} bg-blue-50 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className={labelStyle}>رقم الهاتف*</label>
                  <div className="relative">
                    <img
                      src={tunisianFlag}
                      alt="علم تونس"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    />
                    <input
                      type="tel"
                      name="numeroPhone"
                      value={formData.numeroPhone}
                      onChange={handleChange}
                      className={`${inputStyle} pl-10`}
                      required
                      placeholder="12345678"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>العنوان المهني*</label>
                  <input
                    type="text"
                    name="adressProfessionnel"
                    value={formData.adressProfessionnel}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>الاسم الخاص بالبائع*</label>
                  <input
                    type="text"
                    name="nometprenomlegal"
                    value={formData.nometprenomlegal}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>فئة المنتج*</label>
                  <input
                    type="text"
                    name="categorieProduitMarche"
                    value={formData.categorieProduitMarche}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                    placeholder="مثال: خضروات، فواكه، ألبان"
                  />
                </div>
                <div>
                  <label className={labelStyle}>نوع البائع*</label>
                  <select
                    name="typeDesVendeurs"
                    value={formData.typeDesVendeurs}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                    disabled={isLoadingVendorTypes}
                  >
                    <option value="">اختر نوع البائع</option>
                    {isLoadingVendorTypes ? (
                      <option value="">جارٍ تحميل أنواع البائعين...</option>
                    ) : vendorTypes.length === 0 ? (
                      <option value="">لا توجد أنواع بائعين متاحة</option>
                    ) : (
                      vendorTypes.map((type, index) => (
                        <option key={`type-${index}`} value={type}>
                          {type}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>السوق الافتراضي*</label>
                  <select
                    name="marcheId"
                    value={formData.marcheId}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                    disabled={isLoadingMarkets}
                  >
                    <option value="">اختر السوق</option>
                    {isLoadingMarkets ? (
                      <option value="">جارٍ تحميل الأسواق...</option>
                    ) : markets.length === 0 ? (
                      <option value="">لا توجد أسواق متاحة</option>
                    ) : (
                      markets.map((market) => (
                        <option key={market._id} value={market._id}>
                          {market.nomComplet}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>عنوان التخزين (اختياري)</label>
                  <input
                    type="text"
                    name="adressDeStockage"
                    value={formData.adressDeStockage}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div className="border-t pt-5">
                <h2 className="text-lg font-medium text-blue-900 mb-4">الوثائق المطلوبة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(DOCUMENT_TYPES).map(([docType, docLabel]) => (
                    <div key={docType} className="space-y-2">
                      <label className={labelStyle}>{docLabel} *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id={docType}
                          onChange={handleFileChange(docType)}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                        <label
                          htmlFor={docType}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 text-sm"
                        >
                          اختر ملف
                        </label>
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {files[docType] ? files[docType].name : 'لم يتم اختيار ملف'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingVendorTypes || isLoadingMarkets}
                  className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors ${
                    isSubmitting || isLoadingVendorTypes || isLoadingMarkets ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'جارٍ التقديم...' : 'تقديم طلب التسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandVendeur;