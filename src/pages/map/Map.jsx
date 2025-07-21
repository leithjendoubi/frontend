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

// أيقونة علامة Leaflet المخصصة
const blueIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// معالجة النقرات على الخريطة
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

  // تحليل orderId من الرابط أو الخصائص
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
      toast.error("الرجاء تحديد موقع على الخريطة.");
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
          `${mode === "user" ? "تم حفظ عنوان المستخدم" : "تم حفظ عنوان الطلب"} بنجاح!`
        );
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("خطأ في حفظ العنوان:", error);
      toast.error("فشل في حفظ العنوان.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex-1">
        <MapContainer
          center={[36.8065, 10.1815]} // مركز تونس
          zoom={13}
          className="h-96 w-full rounded-lg shadow-md"
        >
          {/* طبقة العشب/المناطق الخضراء */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
          />
          
          {/* طبقة أساسية بديلة يمكن أن تظهر المزيد من المناطق الخضراء */}
          {/* <TileLayer
            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://www.cyclosm.org/">CyclOSM</a>'
          /> */}
          
          <MapClickHandler setCoordinates={setCoordinates} />
          {coordinates && <Marker position={coordinates} icon={blueIcon} />}
        </MapContainer>
      </div>

      <div className="flex-1 flex flex-col justify-center p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          إضافة {mode === "user" ? "عنوان المستخدم" : "عنوان الطلب"}
        </h2>
        {coordinates ? (
          <div className="mb-6">
            <p className="text-gray-600">
              خط العرض: <span className="font-medium text-blue-600">{coordinates[0].toFixed(4)}</span>
            </p>
            <p className="text-gray-600">
              خط الطول: <span className="font-medium text-blue-600">{coordinates[1].toFixed(4)}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">انقر على الخريطة لتحديد الموقع.</p>
        )}
        <button
          onClick={handleSaveAddress}
          className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          حفظ العنوان
        </button>
      </div>
    </div>
  );
};

export default Map;