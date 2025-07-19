import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import tunisianFlag from '../../assets/tunisianflag.jpg';
import carteInstruction from '../../assets/carteinstruction.jpeg';
import loiDescCartes from '../../assets/loidescartes.jpeg';

const DOCUMENT_TYPES = {
  STORAGE_CERTIFICATE: "شهادة التخزين",
  ID_CARD_COPY: "نسخة بطاقة الهوية",
  APPLICANT_STATUS_CERTIFICATE: "شهادة حالة المتقدم",
  FARMERS_UNION_FORM: "نموذج اتحاد الفلاحين",
  FERTILIZER_TRADE_PERMIT: "رخصة تجارة الأسمدة",
  POULTRY_TRADE_PERMIT: "رخصة تجارة الدواجن"
};

const DemandProducteur = () => {
  const { userData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    numeroPhone: '',
    adressProfessionnel: '',
    categorieProduitMarche: '',
    nometprenomlegal: '',
    adressDeStockage: '',
    typeDesProducteurs: ''
  });

  const [files, setFiles] = useState({
    STORAGE_CERTIFICATE: null,
    ID_CARD_COPY: null,
    APPLICANT_STATUS_CERTIFICATE: null,
    FARMERS_UNION_FORM: null,
    FERTILIZER_TRADE_PERMIT: null,
    POULTRY_TRADE_PERMIT: null
  });

  const [categories, setCategories] = useState([]);
  const [producerTypes, setProducerTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducerTypes, setIsLoadingProducerTypes] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get('http://localhost:4000/api/administration/categories-produits');
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error('فشل في تحميل فئات المنتجات');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const fetchProducerTypes = async () => {
      setIsLoadingProducerTypes(true);
      try {
        const response = await axios.get('http://localhost:4000/api/administration/types-producteurs');
        setProducerTypes(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error('فشل في تحميل أنواع المنتجين');
      } finally {
        setIsLoadingProducerTypes(false);
      }
    };

    fetchCategories();
    fetchProducerTypes();
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

    const requiredDocs = [
      'STORAGE_CERTIFICATE',
      'ID_CARD_COPY',
      'APPLICANT_STATUS_CERTIFICATE',
      'FARMERS_UNION_FORM'
    ];

    if (formData.categorieProduitMarche === 'أسمدة فلاحية') {
      requiredDocs.push('FERTILIZER_TRADE_PERMIT');
    }
    if (formData.categorieProduitMarche === 'دواجن و منتوجاتها') {
      requiredDocs.push('POULTRY_TRADE_PERMIT');
    }

    const missingDocuments = requiredDocs.filter(key => !files[key]);
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
        'http://localhost:4000/api/producteur/',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('تم تقديم طلب تسجيل المنتج بنجاح!');
      setFormData({
        numeroPhone: '',
        adressProfessionnel: '',
        categorieProduitMarche: '',
        nometprenomlegal: '',
        adressDeStockage: '',
        typeDesProducteurs: ''
      });
      setFiles({
        STORAGE_CERTIFICATE: null,
        ID_CARD_COPY: null,
        APPLICANT_STATUS_CERTIFICATE: null,
        FARMERS_UNION_FORM: null,
        FERTILIZER_TRADE_PERMIT: null,
        POULTRY_TRADE_PERMIT: null
      });
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
              
              <p className="mb-2">* يمنع تجميع ونقل وخزن المنتجات الفلاحية والصيد دون الحصول على الصفة</p>
              
              <p className="mb-2">يخولك إمتلاك صفة منتج عرض منتوجاتك في الأسواق المنظمة الإدارية حسب ما يضبطه قانون التوزيع</p>
              
              <p className="mb-2">يخولك لك أيضا الحصول على بطاقة دخول بيضاء و حمراء</p>
              
              <p className="mb-2">في صورة الحصول على إحدى البطاقات الرجاء الإستضهار بها في خانة الصفة</p>
              
              <p className="mb-2">في صورة ما إذا كان نشاطك التجاري من فئة الأسمدة الفلاحية الرجاء الإستظهار بتصريح ممارسة النشاط</p>
              
              <p className="mb-2">في صورة ما إذا كان نشاطك التجاري من فئة الدواجن و منتوجاتها الرجاء الإستظهار بتصريح ممارسة النشاط</p>
              
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
                
                <a href="http://www.sicad.gov.tn/Ar/upload/1438773909.pdf" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline">
                  كراس شروط تنظيم تجارة توزيع الأسمدة الفلاحية
                </a>
                
                <a href="http://www.sicad.gov.tn/Ar/upload/1438692659.pdf"  
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline">
                  كراس شروط تنظيم تجارة الدواجن و منتوجاتها
                </a>
              </div>                                        
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">تسجيل منتج</h1>
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
                  <label className={labelStyle}>الاسم الخاص بالمنتج*</label>
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
                  <select
                    name="categorieProduitMarche"
                    value={formData.categorieProduitMarche}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                    disabled={isLoadingCategories}
                  >
                    <option value="">اختر فئة</option>
                    {isLoadingCategories ? (
                      <option value="">جارٍ تحميل الفئات...</option>
                    ) : categories.length === 0 ? (
                      <option value="">لا توجد فئات متاحة</option>
                    ) : (
                      categories.map((category, index) => (
                        <option key={`category-${index}`} value={category}>
                          {category}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>نوع المنتج*</label>
                  <select
                    name="typeDesProducteurs"
                    value={formData.typeDesProducteurs}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                    disabled={isLoadingProducerTypes}
                  >
                    <option value="">اختر نوع المنتج</option>
                    {isLoadingProducerTypes ? (
                      <option value="">جارٍ تحميل أنواع المنتجين...</option>
                    ) : producerTypes.length === 0 ? (
                      <option value="">لا توجد أنواع منتجين متاحة</option>
                    ) : (
                      producerTypes.map((type, index) => (
                        <option key={`type-${index}`} value={type}>
                          {type}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="sm:col-span-2">
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
                  {['STORAGE_CERTIFICATE', 'ID_CARD_COPY', 'APPLICANT_STATUS_CERTIFICATE', 'FARMERS_UNION_FORM'].map(docType => (
                    <div key={docType} className="space-y-2">
                      <label className={labelStyle}>{DOCUMENT_TYPES[docType]} *</label>
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
                  {formData.categorieProduitMarche === 'أسمدة فلاحية' && (
                    <div className="space-y-2">
                      <label className={labelStyle}>{DOCUMENT_TYPES.FERTILIZER_TRADE_PERMIT} *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="FERTILIZER_TRADE_PERMIT"
                          onChange={handleFileChange('FERTILIZER_TRADE_PERMIT')}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                        <label
                          htmlFor="FERTILIZER_TRADE_PERMIT"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 text-sm"
                        >
                          اختر ملف
                        </label>
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {files.FERTILIZER_TRADE_PERMIT ? files.FERTILIZER_TRADE_PERMIT.name : 'لم يتم اختيار ملف'}
                        </span>
                      </div>
                    </div>
                  )}
                  {formData.categorieProduitMarche === 'دواجن و منتوجاتها' && (
                    <div className="space-y-2">
                      <label className={labelStyle}>{DOCUMENT_TYPES.POULTRY_TRADE_PERMIT} *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="POULTRY_TRADE_PERMIT"
                          onChange={handleFileChange('POULTRY_TRADE_PERMIT')}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                        <label
                          htmlFor="POULTRY_TRADE_PERMIT"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 text-sm"
                        >
                          اختر ملف
                        </label>
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {files.POULTRY_TRADE_PERMIT ? files.POULTRY_TRADE_PERMIT.name : 'لم يتم اختيار ملف'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingCategories || isLoadingProducerTypes}
                  className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors ${
                    isSubmitting || isLoadingCategories || isLoadingProducerTypes ? 'opacity-50 cursor-not-allowed' : ''
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

export default DemandProducteur;