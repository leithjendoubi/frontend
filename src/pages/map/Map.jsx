// Map.jsx
import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import "../../styles/Map.css";

// Custom Leaflet marker icon
const blueIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Handle clicks on the map
const MapClickHandler = ({ setCoordinates }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoordinates([lat, lng]);
    },
  });
  return null;
};

const Map = ({ onClose, orderId: propOrderId }) => {
  const { userData } = useContext(AppContext);
  const [coordinates, setCoordinates] = useState(null);
  const [mode, setMode] = useState("user");
  const [orderId, setOrderId] = useState(propOrderId || null);
  const location = useLocation();

  // Parse orderId from the URL or props
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderIdParam = queryParams.get("orderId");
    if (orderIdParam || propOrderId) {
      setMode("order");
      setOrderId(orderIdParam || propOrderId);
    } else {
      setMode("user");
    }
  }, [location.search, propOrderId]);

  const handleSaveAddress = async () => {
    if (!coordinates) {
      toast.error("Please select a location on the map.");
      return;
    }

    try {
      const payload = {
        coordinates,
        ...(mode === "user" ? { userId: userData?.userId } : { orderId }),
      };

      const endpoint =
        mode === "user"
          ? "http://localhost:4000/api/map/user"
          : "http://localhost:4000/api/map/order";

      const response = await axios.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `${mode === "user" ? "User" : "Order"} address saved successfully!`
        );
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Save address error:", error);
      toast.error("Failed to save address.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex-1">
        <MapContainer
          center={[36.8065, 10.1815]} // Tunis center
          zoom={13}
          className="h-96 w-full rounded-lg shadow-md"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <MapClickHandler setCoordinates={setCoordinates} />
          {coordinates && <Marker position={coordinates} icon={blueIcon} />}
        </MapContainer>
      </div>

      <div className="flex-1 flex flex-col justify-center p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add {mode === "user" ? "User" : "Order"} Address
        </h2>
        {coordinates ? (
          <div className="mb-6">
            <p className="text-gray-600">
              Latitude: <span className="font-medium text-blue-600">{coordinates[0].toFixed(4)}</span>
            </p>
            <p className="text-gray-600">
              Longitude: <span className="font-medium text-blue-600">{coordinates[1].toFixed(4)}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">Click on the map to select a location.</p>
        )}
        <button
          onClick={handleSaveAddress}
          className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Save Address
        </button>
      </div>
    </div>
  );
};

export default Map;