import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import tunisianFlag from '../../assets/tunisianflag.jpg';

const DOCUMENT_TYPES = {
  GRAY_CARD: "الرخصة الرمادية",
  ID_CARD: "بطاقة الهوية",
  FORM: "نموذج مكتمل"
};

const AddLivreur = () => {
  const { userData } = useContext(AppContext);
  const [telephone, setTelephone] = useState('');
  const [files, setFiles] = useState({
    GRAY_CARD: null,
    ID_CARD: null,
    FORM: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (fileType) => (e) => {
    if (e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));
    }
  };

  const validateTunisianPhone = (phone) => {
    const regex = /^\d{8}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.userId) {
      toast.error('معرف المستخدم غير متوفر');
      return;
    }

    if (!validateTunisianPhone(telephone)) {
      toast.error('يرجى إدخال رقم هاتف تونسي صالح (8 أرقام، مثال: 12345678)');
      return;
    }

    if (!files.GRAY_CARD || !files.ID_CARD || !files.FORM) {
      toast.error('يرجى رفع جميع الوثائق المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', userData.userId);
      formData.append('telephone', telephone);
      formData.append('documents', files.GRAY_CARD);
      formData.append('documents', files.ID_CARD);
      formData.append('documents', files.FORM);

      await axios.post('http://localhost:4000/api/livreur/addDemande', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('تم تقديم طلب التسجيل بنجاح!');
      setTelephone('');
      setFiles({
        GRAY_CARD: null,
        ID_CARD: null,
        FORM: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تقديم طلب التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "mt-1 block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 p-2.5 border text-gray-900";
  const labelStyle = "block text-sm font-medium text-blue-800 mb-1";
  const fileInputStyle = "mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";

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

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">تسجيل موزع</h1>
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
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className={`${inputStyle} pl-10`}
                      required
                      placeholder="12345678"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">الصيغة: 12345678 (يمكن إضافة +216 أو 00216 أو 0 اختياريًا)</p>
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

export default AddLivreur;