import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Map from '../map/Map';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import MapButton from '../../components/button';

const MyProfil = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [producerOrders, setProducerOrders] = useState([]);
  const [producerOrdersLoading, setProducerOrdersLoading] = useState(true);
  const [offers, setOffers] = useState({});
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/order/user/${userData.userId}`);
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (userData?.userId) {
      fetchOrders();
    }
  }, [userData?.userId]);

  // Fetch user products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/product/user/my-products`);
        if (response.data.success && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch offers for each order
  useEffect(() => {
    const fetchOffers = async () => {
      if (!userData?.userId || !orders.length) return;

      try {
        const offerPromises = orders.map(order =>
          axios.get(`http://localhost:4000/api/offre/offres/order/${order._id}`)
            .then(res => ({ orderId: order._id, data: res.data.offres?.[0] || null }))
            .catch(err => ({ orderId: order._id, data: null }))
        );
        const offerResults = await Promise.all(offerPromises);
        const offerMap = offerResults.reduce((acc, { orderId, data }) => {
          acc[orderId] = data;
          return acc;
        }, {});
        setOffers(offerMap);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(err.response?.data?.message || 'Failed to fetch offers');
      }
    };

    if (orders.length) {
      fetchOffers();
    }
  }, [orders, userData?.userId]);

  // Fetch orders containing products owned by the current user with status "Order Placed"
  useEffect(() => {
    const fetchProducerOrders = async () => {
      if (!userData?.userId) return;
      
      try {
        const response = await axios.get('http://localhost:4000/api/order/get');
        const allOrders = response.data;

        // Filter orders containing products owned by current user and with status "Order Placed"
        const filteredOrders = [];
        for (const order of allOrders) {
          if (order.status === 'Order Placed') {
            for (const item of order.items) {
              try {
                const productResponse = await axios.get(`http://localhost:4000/api/product/${item.productId}`);
                if (productResponse.data.success && productResponse.data.product.userId === userData.userId) {
                  filteredOrders.push(order);
                  break;
                }
              } catch (err) {
                console.error(`Error fetching product ${item.productId}:`, err);
              }
            }
          }
        }
        setProducerOrders(filteredOrders);
      } catch (err) {
        console.error('Error fetching producer orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setProducerOrdersLoading(false);
      }
    };

    if (userData?.userId) {
      fetchProducerOrders();
    }
  }, [userData?.userId]);

  const handleConfirmOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:4000/api/order/update-status/${orderId}`, {
        status: 'Confirmed and Prepared'
      });
      setProducerOrders(producerOrders.filter(order => order._id !== orderId));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:4000/api/product/delete/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/auth/${userData.userId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUserData({
        ...userData,
        image: response.data.imageUrl
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleType) => {
    try {
      const response = await axios.post(`http://localhost:4000/api/auth/change-role`, {
        userId: userData.userId,
        roleType
      });

      setUserData({
        ...userData,
        isLivreur: response.data.isLivreur,
        isVendeur: response.data.isVendeur,
        isProducteur: response.data.isProducteur
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const openMapDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setIsMapOpen(true);
  };

  const closeMapDialog = () => {
    setIsMapOpen(false);
    setSelectedOrderId(null);
  };

  const handleSeeOffer = (offer) => {
    setSelectedOffer(offer);
    setShowOfferDialog(true);
  };

  const handleCloseOfferDialog = () => {
    setShowOfferDialog(false);
    setSelectedOffer(null);
  };

  const handleUpdateOfferStatus = async (ordreId, status) => {
    try {
      const response = await axios.put(`http://localhost:4000/api/offre/offres/order/${ordreId}`, {
        statutoffre: status
      });

      if (response.data.success) {
        setOffers(prev => ({
          ...prev,
          [ordreId]: { ...prev[ordreId], statutoffre: status }
        }));
        setShowOfferDialog(false);
        setSelectedOffer(null);
      } else {
        setError(response.data.message || 'Failed to update offer status');
      }
    } catch (err) {
      console.error('Error updating offer status:', err);
      setError(err.response?.data?.message || 'Failed to update offer status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-navy-900 mb-8 text-center">My Profile</h1>

        {/* Vertical Layout */}
        <div className="flex flex-col space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {userData.image ? (
                  <img
                    src={userData.image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-light-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-light-blue-50 flex items-center justify-center">
                    <span className="text-navy-500 text-sm">No photo</span>
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-light-blue-500 text-white px-4 py-2 rounded-lg hover:bg-light-blue-600 transition text-sm font-medium">
                {loading ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              <p className="text-xs text-navy-500 mt-2">JPG, PNG (Max 5MB)</p>
                             <MapButton />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-navy-900 mb-2">Current Status:</h3>
              <div className="flex flex-wrap gap-2">
                {userData.isLivreur && (
                  <span className="bg-light-blue-100 text-light-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    Delivery Person
                  </span>
                )}
                {userData.isVendeur && (
                  <span className="bg-navy-100 text-navy-800 px-3 py-1 rounded-full text-xs font-medium">
                    Seller
                  </span>
                )}
                {userData.isProducteur && (
                  <span className="bg-white border border-light-blue-500 text-light-blue-500 px-3 py-1 rounded-full text-xs font-medium">
                    Producer
                  </span>
                )}
                {!userData.isLivreur && !userData.isVendeur && !userData.isProducteur && (
                  <span className="bg-gray-100 text-navy-800 px-3 py-1 rounded-full text-xs font-medium">
                    Client
                  </span>
                )}
              </div>
            </div>

            {!(userData.isLivreur || userData.isVendeur || userData.isProducteur) ? (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-navy-900">Become a:</h3>
                <button
                  onClick={() => navigate("/addlivreur")}
                  className="w-full bg-light-blue-500 text-white py-2 rounded-lg hover:bg-light-blue-600 transition text-sm font-medium"
                >
                  Delivery Person
                </button>
                <button
                  onClick={() => navigate("/demandproducteur")}
                  className="w-full bg-navy-500 text-white py-2 rounded-lg hover:bg-navy-600 transition text-sm font-medium"
                >
                  Producer
                </button>
                <button
                  onClick={() => navigate("/demandvendeur")}
                  className="w-full bg-light-blue-700 text-white py-2 rounded-lg hover:bg-light-blue-800 transition text-sm font-medium"
                >
                  Seller
                </button>
                <button
                  onClick={() => navigate("/CreateProduct")}
                  className="w-full bg-navy-700 text-white py-2 rounded-lg hover:bg-navy-800 transition text-sm font-medium"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleRoleChange('client')}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Return to Client Status
                </button>
                <button
                  onClick={() => navigate("/CreateProduct")}
                  className="w-full bg-navy-700 text-white py-2 rounded-lg hover:bg-navy-800 transition text-sm font-medium"
                >
                  Add Product
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-navy-700 text-sm font-medium mb-1">Name</label>
                <p className="p-2 bg-light-blue-50 rounded text-navy-900">{userData?.name || 'Not available'}</p>
              </div>
              <div>
                <label className="block text-navy-700 text-sm font-medium mb-1">Email</label>
                <p className="p-2 bg-light-blue-50 rounded text-navy-900">{userData?.email || 'Not available'}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-light-blue-100 text-light-blue-800 rounded-lg text-sm">
                Action completed successfully!
              </div>
            )}
          </div>

          {/* Orders for My Products */}
          {producerOrders.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-navy-900 mb-4">Orders for My Products</h2>
              {producerOrdersLoading ? (
                <p className="text-navy-500">Loading producer orders...</p>
              ) : (
                <div className="space-y-4">
                  {producerOrders.map((order) => (
                    <div key={order._id} className="border border-light-blue-200 rounded-lg p-4 bg-light-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-navy-900">Order #{order._id.substring(0, 8)}</p>
                          <p className="text-sm text-navy-500">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-light-blue-100 text-light-blue-800">
                          {order.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-light-blue-200">
                            <div>
                              <p className="text-navy-900">{item.name}</p>
                              <p className="text-sm text-navy-500">
                                {item.quantity} x {item.price} DT ({item.size})
                              </p>
                            </div>
                            <p className="text-navy-900">{item.quantity * item.price} DT</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between border-t border-light-blue-200 pt-2">
                        <div>
                          <p className="text-sm text-navy-500">Delivery: {order.typeLivraison}</p>
                          <p className="text-sm text-navy-500">Payment: {order.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-navy-900">Total: {order.amount + order.amount_livraison} DT</p>
                          <p className="text-sm text-navy-500">(Products: {order.amount} DT)</p>
                          {order.amount_livraison > 0 && (
                            <p className="text-sm text-navy-500">(Delivery: {order.amount_livraison} DT)</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="contained"
                          className="!bg-navy-700 hover:!bg-navy-800"
                          onClick={() => handleConfirmOrder(order._id)}
                        >
                          Confirm and Prepared
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">My Orders</h2>
            {ordersLoading ? (
              <p className="text-navy-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-navy-500">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-light-blue-200 rounded-lg p-4 bg-light-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-navy-900">Order #{order._id.substring(0, 8)}</p>
                        <p className="text-sm text-navy-500">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'Order Placed' ? 'bg-light-blue-100 text-light-blue-800' :
                        order.status === 'Completed' ? 'bg-navy-100 text-navy-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-light-blue-200">
                          <div>
                            <p className="text-navy-900">{item.name}</p>
                            <p className="text-sm text-navy-500">
                              {item.quantity} x {item.price} DT ({item.size})
                            </p>
                          </div>
                          <p className="text-navy-900">{item.quantity * item.price} DT</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between border-t border-light-blue-200 pt-2">
                      <div>
                        <p className="text-sm text-navy-500">Delivery: {order.typeLivraison}</p>
                        <p className="text-sm text-navy-500">Payment: {order.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-navy-900">Total: {order.amount + order.amount_livraison} DT</p>
                        <p className="text-sm text-navy-500">(Products: {order.amount} DT)</p>
                        {order.amount_livraison > 0 && (
                          <p className="text-sm text-navy-500">(Delivery: {order.amount_livraison} DT)</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button 
                        variant="contained" 
                        className="!bg-light-blue-500 hover:!bg-light-blue-600"
                        onClick={() => openMapDialog(order._id)}
                      >
                        Add Address
                      </Button>
                      {offers[order._id] && (
                        <Button
                          variant="contained"
                          className="!bg-navy-700 hover:!bg-navy-800"
                          onClick={() => handleSeeOffer(offers[order._id])}
                        >
                          See Offer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">My Products</h2>
            {productsLoading ? (
              <p className="text-navy-500">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-navy-500">No products found</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id} className="border border-light-blue-200 rounded-lg p-4 bg-light-blue-50 relative">
                    <div className="flex items-start space-x-4">
                      {product.image && product.image[0]?.url && (
                        <img
                          src={product.image[0].url}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-navy-900">{product.name}</p>
                        <p className="text-sm text-navy-500">{product.description}</p>
                        <p className="text-sm mt-1">
                          <strong>Category:</strong> {product.category} / {product.subCategory}
                        </p>
                        <p className="text-sm">
                          <strong>Price:</strong> {product.price} DT
                        </p>
                        <p className="text-sm">
                          <strong>Size:</strong> {product.sizes?.join(', ') || 'N/A'}
                        </p>
                        {product.poidnet?.length > 0 && (
                          <p className="text-sm">
                            <strong>Net Weight:</strong> {product.poidnet.join(', ')}
                          </p>
                        )}
                        {product.availablepoids?.length > 0 && (
                          <p className="text-sm">
                            <strong>Available Weight:</strong> {product.availablepoids.join(', ')}
                          </p>
                        )}
                        <p className="text-sm">
                          <strong>Market:</strong> {product.marcheID || 'No market'}
                        </p>
                        <p className="text-sm">
                          <strong>Date:</strong> {new Date(product.date).toLocaleDateString()}
                        </p>
                      </div>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteProduct(product._id)}
                        className="!absolute !top-2 !right-2"
                      >
                        <DeleteIcon className="!text-red-600" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={isMapOpen} onClose={closeMapDialog} maxWidth="md" fullWidth>
          <DialogTitle className="bg-navy-50 text-navy-900">Select Address on Map</DialogTitle>
          <DialogContent>
            <Map orderId={selectedOrderId} />
          </DialogContent>
        </Dialog>

        <Dialog open={showOfferDialog} onClose={handleCloseOfferDialog} maxWidth="sm" fullWidth>
          <DialogTitle className="bg-navy-50 text-navy-900">Offer Details</DialogTitle>
          <DialogContent>
            {selectedOffer ? (
              <div className="space-y-2 text-navy-900">
                <p><strong>User ID:</strong> {selectedOffer.userId}</p>
                <p><strong>Type:</strong> {selectedOffer.typeoffre}</p>
                <p><strong>Price:</strong> {selectedOffer.pricepardinar} TND</p>
                <p><strong>Order ID:</strong> {selectedOffer.ordreId.substring(0, 8)}</p>
                <p><strong>Status:</strong> {selectedOffer.statutoffre}</p>
              </div>
            ) : (
              <p className="text-navy-500">No offer details available</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOfferDialog} className="!text-navy-700">
              Close
            </Button>
            {selectedOffer?.statutoffre === 'waiting' && (
              <>
                <Button
                  onClick={() => handleUpdateOfferStatus(selectedOffer.ordreId, 'accepted')}
                  className="!bg-navy-700 hover:!bg-navy-800 !text-white"
                  variant="contained"
                >
                  Accept
                </Button>
                <Button
                  onClick={() => handleUpdateOfferStatus(selectedOffer.ordreId, 'rejected')}
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                  variant="contained"
                >
                  Deny
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProfil;