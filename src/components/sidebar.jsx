import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from 'react';
import { AppContext } from "../context/AppContext";

// Information Holder for menu configuration
const menuItems = [
  { name: "منتجات عامة ", path: "/Marche", icon: assets.product },
  { name: "منتجات عامة و بالجملة", path: "/allproducts", icon: assets.marche_icon },
  { name: "الأسواق الإدارية", path: "/Market", icon: assets.marche_icon },
  { name: "المخزنون", path: "/findstockage", icon: assets.stockicon },     
  { name: "خريطة الإنتاج", path: "/showmap", icon: assets.maps_icon },
  { name: "قائمة الشاحنين", path: "/livreurs", icon: assets.livreuricon },
  { name: "فرص توصيل", path: "/showorder", icon: assets.livraison_icon },
  { name: "تواكيل بيع بالجملة", path: "/mandat", icon: assets.mandat },
  { name: "قائمة البائعين", path: "/venderlist", icon: assets.mandat },
];

// Controller for sidebar visibility
const useSidebarVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      if (!isMobile && e.clientX <= 50) {
        setIsVisible(true);
      } else if (!isMobile && e.clientX > 250) {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return { isVisible, setIsVisible, isMobile };
};

// Presentational Component for Menu Item
const MenuItem = ({ item, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full p-3 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-500 text-sm sm:text-base"
    >
      <img src={item.icon} alt={item.name} className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
      <span className="font-medium">{item.name}</span>
    </button>
  </li>
);

// Main Component
const Sidebar = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const { isVisible, setIsVisible, isMobile } = useSidebarVisibility();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsVisible(false); // Close sidebar on mobile after navigation
    }
    console.log(userData.userId);
  };

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isVisible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`flex h-screen w-64 bg-white border-r-2 border-blue-500 fixed top-0 flex-col transition-all duration-300 ease-in-out z-40 ${
          isVisible ? 'left-0' : '-left-64'
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-blue-700">القائمة</h2>
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-grow"></div>
        
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
          <ul className="space-y-1 w-full">
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index}
                item={item}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </ul>
        </div>
        
        <div className="flex-grow"></div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isVisible && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;