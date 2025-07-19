import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { userData } = useContext(AppContext);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-12 md:mt-20 px-4 md:px-8 lg:px-12 text-gray-800">
      {/* Left side - Text content */}
      <div className="order-2 md:order-1 text-center md:text-left w-full md:w-1/2 mb-8 md:mb-0">
        <h1 className="flex items-center justify-center md:justify-start gap-3 text-3xl sm:text-4xl md:text-5xl font-medium text-white">
          عسلامة {userData ? userData.name : "Developer"}!
          <img
            className="w-10 md:w-12 aspect-square"
            src={assets.hand_wave}
            alt="hand_wave"
          />
        </h1>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 text-white mt-4">
          مرحبا بيك
        </h2>
        
        <p className="mb-10 max-w-2xl text-xl md:text-2xl text-white leading-relaxed">
          تمت إضافتك بصفة مستهلك نهائي ، يمكنك تغيير صفتك للحصول على أكثر خدمات
        </p>
        
        <button className="border-2 border-white rounded-full px-10 py-3.5 hover:bg-white hover:text-gray-800 transition-all text-white text-lg font-medium shadow-lg hover:shadow-xl">
          ملفك الشخصي
        </button>
      </div>

      {/* Right side - Image */}
      <div className="order-6 md:order-2 w-full md:w-1/5 flex justify-center md:justify-end">
        <img
          src={assets.header_img}
          alt="header_img"
          className="w-48 h-48 md:w-64 md:h-64 lg:w-50 lg:h-80 rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>
    </div>
  );
};

export default Header;