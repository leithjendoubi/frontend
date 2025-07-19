import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { AppContext } from '../../context/AppContext';

//      <ToastContainer />
const ShowOrderToDeliver = () => {
  const { userData } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerInputs, setOfferInputs] = useState({});
  const [priceInputs, setPriceInputs] = useState({});
  const [offerErrors, setOfferErrors] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders
        const ordersResponse = await axios.get('http://localhost:4000/api/order/waiting-livreur');
        const ordersData = ordersResponse.data;

        // Fetch product details for each product ID
        const productPromises = ordersData.flatMap(order =>
          order.items.map(item =>
            axios.get(`http://localhost:4000/api/product/${item.productId}`)
              .then(res => ({ id: item.productId, data: res.data.product }))
          )
        );
        const productResults = await Promise.all(productPromises);
        const productMap = productResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});

        // Fetch user details for each user ID
        const userPromises = [...new Set(ordersData.map(order => order.userId))].map(userId =>
          axios.post('http://localhost:4000/api/user/userdata', { userId })
            .then(res => ({ id: userId, data: res.data.userData }))
        );
        const userResults = await Promise.all(userPromises);
        const userMap = userResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});

        setOrders(ordersData);
        setProducts(productMap);
        setUsers(userMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAddOfferClick = (orderId) => {
    setOfferInputs(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    setOfferErrors(prev => ({ ...prev, [orderId]: null }));
  };

  const handlePriceChange = (orderId, value) => {
    setPriceInputs(prev => ({ ...prev, [orderId]: value }));
  };

  const handleSubmitOffer = async (orderId) => {
    if (!userData?.userId) {
      setOfferErrors(prev => ({ ...prev, [orderId]: 'User not logged in' }));
      return;
    }

    const pricepardinar = priceInputs[orderId];
    if (!pricepardinar || isNaN(pricepardinar) || pricepardinar <= 0) {
      setOfferErrors(prev => ({ ...prev, [orderId]: 'Please enter a valid price' }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/offre/offres', {
        userId: userData.userId,
        typeoffre: 'livraison',
        pricepardinar: parseFloat(pricepardinar),
        ordreId: orderId,
      });

      if (response.data.success) {
        setOfferInputs(prev => ({ ...prev, [orderId]: false }));
        setPriceInputs(prev => ({ ...prev, [orderId]: '' }));
        setOfferErrors(prev => ({ ...prev, [orderId]: null }));
        alert('Offer submitted successfully!');
      } else {
        setOfferErrors(prev => ({ ...prev, [orderId]: response.data.message || 'Failed to submit offer' }));
      }
    } catch (error) {
      console.error('Offer submission error:', error);
      setOfferErrors(prev => ({ ...prev, [orderId]: error.response?.data?.message || 'Failed to submit offer' }));
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders to Deliver</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => {
          const totalWeight = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const user = users[order.userId];

          return (
            <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center mb-4">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-gray-600">User: {user?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Amount:</span> {order.amount} TND
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Total Weight:</span> {totalWeight} Kilogrammes
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Delivery Address:</span> {order.address}
                </p>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-2">Products:</h3>
                <ul className="list-disc pl-5">
                  {order.items.map(item => (
                    <li key={item.productId} className="text-gray-600">
                      {products[item.productId]?.name || item.name} - {item.quantity} {item.size}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleAddOfferClick(order._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={!userData?.userId}
                >
                  {offerInputs[order._id] ? 'Cancel' : 'Add Offer'}
                </button>
                {offerInputs[order._id] && (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Enter price (TND)"
                      value={priceInputs[order._id] || ''}
                      onChange={(e) => handlePriceChange(order._id, e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      min="0"
                      step="0.01"
                    />
                    {offerErrors[order._id] && (
                      <p className="text-red-500 text-sm mt-1">{offerErrors[order._id]}</p>
                    )}
                    <button
                      onClick={() => handleSubmitOffer(order._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
                    >
                      Submit Offer
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShowOrderToDeliver;