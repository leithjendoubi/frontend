import { useState } from 'react';
import axios from 'axios';

const CreateEquipement = () => {
  const [formData, setFormData] = useState({
    UserId: '',
    nom: '',
    Poidsdisponibleenkillo: '',
    Prixparjour: '',
    Prixparkillo: '',
    listdesproduits: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    const data = new FormData();
    data.append('UserId', formData.UserId);
    data.append('nom', formData.nom);
    data.append('Poidsdisponibleenkillo', formData.Poidsdisponibleenkillo);
    data.append('Prixparjour', formData.Prixparjour);
    data.append('Prixparkillo', formData.Prixparkillo);
    data.append('listdesproduits', formData.listdesproduits.split(',').map(item => item.trim()));
    if (image) {
      data.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:4000/api/equipement/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      // Reset form
      setFormData({
        UserId: '',
        nom: '',
        Poidsdisponibleenkillo: '',
        Prixparjour: '',
        Prixparkillo: '',
        listdesproduits: '',
      });
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء المعدات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-blue-800">إنشاء معدات جديدة</h2>
          <p className="mt-2 text-blue-600">املأ التفاصيل لإضافة معدات تخزين جديدة</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-8">
            {message && (
              <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                <p>{message}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">معرف المستخدم</label>
                  <input
                    type="text"
                    name="UserId"
                    value={formData.UserId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">اسم المعدات</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">الوزن المتاح (كجم)</label>
                  <input
                    type="number"
                    name="Poidsdisponibleenkillo"
                    value={formData.Poidsdisponibleenkillo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">السعر لكل يوم</label>
                  <input
                    type="number"
                    name="Prixparjour"
                    value={formData.Prixparjour}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">السعر لكل كيلو</label>
                  <input
                    type="number"
                    name="Prixparkillo"
                    value={formData.Prixparkillo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">قائمة المنتجات (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    name="listdesproduits"
                    value={formData.listdesproduits}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    placeholder="مثال: تفاح، برتقال، موز"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-700 mb-1">صورة المعدات</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-lg cursor-pointer transition duration-300">
                          <div className="flex flex-col items-center justify-center pt-7">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="pt-1 text-sm text-blue-500">
                              {image ? image.name : 'رفع صورة'}
                            </p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="opacity-0" 
                          />
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="flex-shrink-0">
                        <img src={imagePreview} alt="معاينة" className="h-32 w-32 object-cover rounded-lg border border-blue-200" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري المعالجة...
                    </span>
                  ) : 'إنشاء معدات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEquipement;