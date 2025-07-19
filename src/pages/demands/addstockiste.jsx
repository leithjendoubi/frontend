import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import tunisianFlag from '../../assets/tunisianflag.jpg';

const DOCUMENT_TYPES = {
  TAX_NUMBER: "رقم الضريبة",
  MUNICIPAL_OPERATING_LICENSE: "رخصة التشغيل البلدية",
  TECHNICAL_CERTIFICATE: "شهادة تقنية",
  COMMERCIAL_REGISTRATION: "التسجيل التجاري"
};

const STORAGE_TYPES = {
  COOLING_ROOMS: "غرف تبريد",
  COOLING_AND_STORAGE_ROOMS: "غرف تبريد و غرف تخزين",
  FREEZING_ROOMS: "غرف تثليج"
};

const AddStockiste = () => {
  const { userData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    numeroPhone: '',
    addressProfessionelle: '',
    nomlegal: '',
    typedestockage: 'COOLING_ROOMS', // Default value
    statusdedamnd: 'en traitement', // Hidden but sent with form
  });
  const [files, setFiles] = useState({
    TAX_NUMBER: null,
    MUNICIPAL_OPERATING_LICENSE: null,
    TECHNICAL_CERTIFICATE: null,
    COMMERCIAL_REGISTRATION: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
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
      key => !formData[key] && key !== 'typedestockage' && key !== 'statusdedamnd'
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
      const data = new FormData();
      data.append('userId', userData?.userId || '');
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) data.append(key, file);
      });

      const response = await axios.post('http://localhost:4000/api/stockiste/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'تم إضافة المخزن بنجاح!');
      setFormData({
        numeroPhone: '',
        addressProfessionelle: '',
        nomlegal: '',
        typedestockage: 'COOLING_ROOMS',
        statusdedamnd: 'en traitement',
      });
      setFiles({
        TAX_NUMBER: null,
        MUNICIPAL_OPERATING_LICENSE: null,
        TECHNICAL_CERTIFICATE: null,
        COMMERCIAL_REGISTRATION: null,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في إضافة المخزن');
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
            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
              * يجب تقديم جميع الوثائق المطلوبة لتسجيل المخزن بما يتماشى مع اللوائح القانونية.
            </p>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">إضافة مخزن جديد</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      onChange={handleInputChange}
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
                    name="addressProfessionelle"
                    value={formData.addressProfessionelle}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>الاسم القانوني*</label>
                  <input
                    type="text"
                    name="nomlegal"
                    value={formData.nomlegal}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>نوع التخزين*</label>
                  <select
                    name="typedestockage"
                    value={formData.typedestockage}
                    onChange={handleInputChange}
                    className={selectStyle}
                    required
                  >
                    <option value="COOLING_ROOMS">{STORAGE_TYPES.COOLING_ROOMS}</option>
                    <option value="COOLING_AND_STORAGE_ROOMS">{STORAGE_TYPES.COOLING_AND_STORAGE_ROOMS}</option>
                    <option value="FREEZING_ROOMS">{STORAGE_TYPES.FREEZING_ROOMS}</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-lg font-medium text-blue-900 mb-4">الوثائق المطلوبة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(DOCUMENT_TYPES).map(docType => (
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
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export default AddStockiste;