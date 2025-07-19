import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext'; // Adjust the path as needed

const ToDeliver = () => {
  const { userData } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/order/orders/6863cb8247c5bfe20e76bb9f', {
          headers: {
            'Content-Type': 'application/json',
            'userId': userData.userId
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.data); // Access the 'data' array from the response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userData.userId]);

  const handleDeliveryStarted = (orderId) => {
    console.log(`Delivery started for order ${orderId}`);
    // Add your delivery started logic here
  };

  const handleDeliverySuccess = (orderId) => {
    console.log(`Delivery succeeded for order ${orderId}`);
    // Add your delivery success logic here
  };

  const handleDeliveryFailed = (orderId) => {
    console.log(`Delivery failed for order ${orderId}`);
    // Add your delivery failed logic here
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders To Deliver ({orders.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h2>
              <span className={`px-2 py-1 text-xs rounded ${
                order.status === 'Delivery Assigned' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Phone:</span> {order.numeroPhone}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Address:</span> {order.address}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Delivery Type:</span> {order.typeLivraison}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Date:</span> {new Date(order.date).toLocaleString()}
              </p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-3 my-3">
              <h3 className="font-medium mb-2">Items:</h3>
              <ul className="space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name} ({item.size})</span>
                    <span>{item.quantity} × {item.price} DT = {item.quantity * item.price} DT</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium">Delivery Fee:</p>
              <p>{order.amount_livraison} DT</p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <p className="font-medium text-lg">Total Amount:</p>
              <p className="font-bold text-lg">{order.amount + order.amount_livraison} DT</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleDeliveryStarted(order._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
              >
                Delivery Started
              </button>
              
              <button
                onClick={() => handleDeliverySuccess(order._id)}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
              >
                Delivery Succeeded
              </button>
              
              <button
                onClick={() => handleDeliveryFailed(order._id)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
              >
                Delivery Failed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToDeliver;