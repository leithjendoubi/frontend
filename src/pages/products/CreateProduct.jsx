import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
  const { userData, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const backendUrl = "http://localhost:4000";

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: "",
    poidnet: "",
    availablepoids: "",
    marcheID: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [units] = useState(["لتر", "كيلوغرام", "طن", "غرام"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserData();
    axios.get(`${backendUrl}/api/administration/categories-produits`)
      .then(response => setCategories(response.data))
      .catch(() => toast.error("خطأ في تحميل الفئات"));
    
    axios.get(`${backendUrl}/api/marche/`)
      .then(response => setMarkets(response.data))
      .catch(() => toast.error("خطأ في تحميل الأسواق"));
  }, [getUserData]);

  const handleCategoryChange = async (e) => {
    const selectedCategory = e.target.value;
    setProductData(prev => ({
      ...prev,
      category: selectedCategory,
      subCategory: "",
      sizes: ""
    }));

    if (selectedCategory) {
      try {
        const response = await axios.post(`${backendUrl}/api/administration/produitparcategorie`, {
          categorie: selectedCategory
        });
        setSubCategories(response.data[1] || []);
      } catch {
        toast.error("خطأ في تحميل الفئات الفرعية");
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!productData.name || !productData.description || !productData.price || 
          !productData.category || !productData.subCategory || !productData.sizes || !selectedFile) {
        throw new Error("جميع الحقول المطلوبة يجب ملؤها");
      }

      if (!userData || !userData.userId) {
        throw new Error("المستخدم غير موثق");
      }

      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value || (key === "marcheID" ? "aucun marche" : ""));
      });
      formData.append("image", selectedFile);
      formData.append("userId", userData.userId);

      const response = await axios.post(`${backendUrl}/api/product/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        toast.success("تم إنشاء المنتج بنجاح!");
      
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error("عليك إختيار سوق");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "mt-1 block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 p-2.5 border text-gray-900";
  const labelStyle = "block text-sm font-medium text-blue-800 mb-1";
  const selectStyle = `${inputStyle} bg-white`;

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Regulatory Information Card */}
          <div className="bg-blue-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">اللوائح القانونية</h2>
            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
              ٠ حسب الفصل عدد 4 : يمنع التعامل وشراء المنتجات الفلاحية والصيد البحري خارج الفضاءات المرخصة لها والأسواق المنشأة من قبل الدولة.
              يمكن بيع وشراء المنتجات الفلاحية دون إتباع مسالك التوزيع طبق إجراءات يقننها وزير التجارة ووزارة الفلاحة والصيد البحري.
              تخضع بعض السلع إلى التسعيرة ومعايير وجب اتباعها مقننة من وزارة التجارة.
            </p>
                        <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
              ٠ حسب الفصل عدد 4 : يمنع التعامل وشراء المنتجات الفلاحية والصيد البحري خارج الفضاءات المرخصة لها والأسواق المنشأة من قبل الدولة.
              يمكن بيع وشراء المنتجات الفلاحية دون إتباع مسالك التوزيع طبق إجراءات يقننها وزير التجارة ووزارة الفلاحة والصيد البحري.
              تخضع بعض السلع إلى التسعيرة ومعايير وجب اتباعها مقننة من وزارة التجارة.
            </p>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">إنشاء منتج جديد</h1>
            <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className={labelStyle}>الاسم*</label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>

                {/* Price Field */}
                <div>
                  <label className={labelStyle}>السعر*</label>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className={labelStyle}>الوصف*</label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  rows={4}
                  className={inputStyle}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className={labelStyle}>صورة المنتج*</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <label className={labelStyle}>الفئة*</label>
                  <select
                    name="category"
                    value={productData.category}
                    onChange={handleCategoryChange}
                    className={selectStyle}
                    required
                  >
                    <option value="">اختر فئة</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Dropdown */}
                {productData.category && (
                  <div>
                    <label className={labelStyle}>الفئة الفرعية*</label>
                    <select
                      name="subCategory"
                      value={productData.subCategory}
                      onChange={handleChange}
                      className={selectStyle}
                      required
                    >
                      <option value="">اختر فئة فرعية</option>
                      {subCategories.map(subCat => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Units Dropdown */}
                <div>
                  <label className={labelStyle}>الوحدات المتوفرة*</label>
                  <select
                    name="sizes"
                    value={productData.sizes}
                    onChange={handleChange}
                    className={selectStyle}
                    required
                  >
                    <option value="">اختر وحدة</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* Market Dropdown */}
                <div>
                  <label className={labelStyle}>السوق</label>
                  <select
                    name="marcheID"
                    value={productData.marcheID}
                    onChange={handleChange}
                    className={selectStyle}
                  >
                    <option value="aucun marche">لا سوق</option>
                    {markets.map(market => (
                      <option key={market._id} value={market._id}>{market.nomComplet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poid Net Field */}
                <div>
                  <label className={labelStyle}>الوزن الصافي</label>
                  <input
                    type="text"
                    name="poidnet"
                    value={productData.poidnet}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                {/* Available Poids Field */}
                <div>
                  <label className={labelStyle}>الأوزان المتوفرة</label>
                  <input
                    type="text"
                    name="availablepoids"
                    value={productData.availablepoids}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "جارٍ الإنشاء..." : "إنشاء المنتج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;