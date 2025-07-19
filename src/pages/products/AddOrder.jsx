import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const AddOrder = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    numeroPhone: '00216',
    city: '',
    postalCode: '',
    streetAddress: '',
    typeLivraison: '',
    centrePickup: '',
    paymentMethod: '',
  });

  const tunisianCities = [
    'تونس',
    'أريانة',
    'بن عروس',
    'منوبة',
    'نابل',
    'زغوان',
    'بنزرت',
    'باجة',
    'جندوبة',
    'الكاف',
    'سليانة',
    'القيروان',
    'القصرين',
    'سيدي بوزيد',
    'سوسة',
    'المنستير',
    'المهدية',
    'صفاقس',
    'قابس',
    'مدنين',
    'تطاوين',
    'قبلي',
    'توزر',
    'قفصة'
  ];

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const cartResponse = await axios.post(
          'http://localhost:4000/api/cart/get',
          { userId: userData.userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        const cartData = cartResponse.data.cartData;
        setCartItems(cartData);

        const productIds = Object.keys(cartData);
        const productPromises = productIds.map(async (productId) => {
          try {
            const response = await axios.get(`http://localhost:4000/api/product/${productId}`);
            return response.data.product;
          } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
            return null;
          }
        });

        const productResults = await Promise.all(productPromises);
        const productsData = {};
        productResults.forEach((product, index) => {
          if (product) {
            productsData[productIds[index]] = product;
          }
        });

        setProducts(productsData);

        let calculatedTotal = 0;
        Object.entries(cartData).forEach(([productId, sizes]) => {
          Object.entries(sizes).forEach(([size, quantity]) => {
            if (productsData[productId]) {
              calculatedTotal += productsData[productId].price * quantity;
            }
          });
        });
        setTotal(calculatedTotal.toFixed(2));

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (userData) {
      fetchCartData();
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('00216')) {
      value = '00216' + value.replace(/^00216/, '');
    }
    setFormData(prev => ({ ...prev, numeroPhone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const items = Object.entries(cartItems).map(([productId, sizes]) => {
        return Object.entries(sizes).map(([size, quantity]) => ({
          productId,
          name: products[productId]?.name || 'Unknown Product',
          price: products[productId]?.price || 0,
          size,
          quantity
        }));
      }).flat();

      const fullAddress = formData.typeLivraison === 'centre pickup' 
        ? `Centre de pickup: ${formData.centrePickup}`
        : `${formData.city}, ${formData.postalCode}, ${formData.streetAddress}`;

      const orderData = {
        userId: userData.userId,
        numeroPhone: formData.numeroPhone,
        items,
        amount: total,
        address: fullAddress,
        typeLivraison: formData.typeLivraison,
        paymentMethod: formData.paymentMethod,
      };

      const response = await axios.post(
        'http://localhost:4000/api/order/add',
        orderData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.success) {
        await axios.post(
          'http://localhost:4000/api/cart/delete-cart',
          { userId: userData.userId },
        );
        navigate(`/marche`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-800 sm:text-4xl">Passer une Commande</h1>
          <p className="mt-2 text-lg text-blue-600">Finalisez votre achat en quelques étapes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-blue-700 text-white">
              <h2 className="text-xl font-semibold">Résumé de la Commande</h2>
            </div>
            
            <div className="p-6">
              {Object.keys(cartItems).length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {Object.entries(cartItems).map(([productId, sizes]) => (
                      <div key={productId} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0">
                          <img 
                            src={products[productId]?.image[0]?.url || ''} 
                            alt={products[productId]?.name} 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{products[productId]?.name}</h3>
                          <div className="mt-2 space-y-2">
                            {Object.entries(sizes).map(([size, quantity]) => (
                              <div key={size} className="flex justify-between text-sm text-gray-600">
                                <span>
                                  {size}: {quantity} × {products[productId]?.price} DT
                                </span>
                                <span className="font-medium text-blue-700">
                                  {(products[productId]?.price * quantity).toFixed(2)} DT
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Sous-total</span>
                      <span className="font-medium text-gray-900">{total} DT</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium text-gray-700">Livraison</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <span className="text-lg font-bold text-blue-800">Total</span>
                      <span className="text-lg font-bold text-blue-800">{total} DT</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-blue-700 text-white">
              <h2 className="text-xl font-semibold">Informations de Livraison</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {/* Phone Number */}
                <div>
                  <label htmlFor="numeroPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      +216
                    </div>
                    <input
                      type="tel"
                      id="numeroPhone"
                      name="numeroPhone"
                      value={formData.numeroPhone}
                      onChange={handlePhoneChange}
                      className="block w-full pl-14 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      pattern="00216[0-9]{8}"
                      maxLength="13"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 00216XXXXXXXX</p>
                </div>

                {/* Delivery Type */}
                <div>
                  <label htmlFor="typeLivraison" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de Livraison
                  </label>
                  <select
                    id="typeLivraison"
                    name="typeLivraison"
                    value={formData.typeLivraison}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="par toi meme">Par toi-même</option>
                    <option value="centre pickup">Centre de pickup</option>
                    <option value="attendez une livraison">Attendez une livraison</option>
                    <option value="par firma">Par Firma</option>
                  </select>
                </div>

                {/* Conditional Fields */}
                {formData.typeLivraison === 'centre pickup' ? (
                  <div>
                    <label htmlFor="centrePickup" className="block text-sm font-medium text-gray-700 mb-1">
                      Centre de Pickup
                    </label>
                    <select
                      id="centrePickup"
                      name="centrePickup"
                      value={formData.centrePickup}
                      onChange={handleChange}
                      className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un centre</option>
                      <option value="bizerte">Bizerte</option>
                      <option value="tunis">Tunis</option>
                      <option value="nabeul">Nabeul</option>
                      <option value="ariana">Ariana</option>
                      <option value="mateur">Mateur</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Sélectionnez votre ville</option>
                        {tunisianCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        pattern="[0-9]{4}"
                        maxLength="4"
                      />
                    </div>

                    {/* Street Address */}
                    <div>
                      <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse Complète
                      </label>
                      <textarea
                        id="streetAddress"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleChange}
                        className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        required
                        placeholder="rue ali khamessi, immeuble no. 5, etc."
                      />
                    </div>
                  </>
                )}

                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Méthode de Paiement
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="à livraison">À livraison</option>
                    <option value="en ligne">En ligne</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={Object.keys(cartItems).length === 0 || isSubmitting}
                className={`w-full mt-8 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  Object.keys(cartItems).length === 0 || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  'Confirmer la Commande'
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;