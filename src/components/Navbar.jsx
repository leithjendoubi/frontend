import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import CartPage from "../pages/products/CartPage";
import trolleyIcon from "../assets/wired-outline-146-trolley-hover-jump.gif";
import toDelieverIcon from "../assets/todeliever.png";
import stockIcon from "../assets/stockicon1.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/");
        setShowMobileMenu(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navItems = [
    { name: "<strong>الرئيسية</strong>", path: "/Home" },   
    { name: "<strong>ملفي الشخصي</strong>", path: "/myprofil" },
    { name: "<strong>اتصل بنا</strong>", path: "/Home" },
    { name: "<strong>من نحن</strong>", path: "/Home" },
    { name: "<strong>تسجيل الخروج</strong>", action: logout },
  ];

  return (
    <>
      <nav className="w-full flex justify-between items-center p-3 sm:p-4 md:p-6 lg:px-24 fixed top-0 bg-white/80 backdrop-blur-md border-b border-blue-100 z-50 transition-all duration-300">
        {/* Logo */}
        <img
          src={assets.elfirma}
          alt="logo"
          className="w-20 sm:w-24 md:w-28 lg:w-32 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/Home")}
        />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 md:gap-6">
          {navItems.map((item, index) => {
            if (item.condition === false) return null;
            return (
              <button
                key={index}
                onClick={() => (item.action ? item.action() : navigate(item.path))}
                className="px-3 py-2 text-blue-700 hover:text-blue-900 font-medium rounded-lg transition-all duration-300 hover:bg-blue-50/50"
                dangerouslySetInnerHTML={{ __html: item.name }}
              />
            );
          })}

          {/* Stock icon button */}
          <button
            onClick={() => navigate("/stockeur")}
            className="p-2 rounded-full hover:bg-blue-50/50 transition-all duration-300"
          >
            <img src={stockIcon} alt="Stock" className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* ToDeliever icon button */}
          <button
            onClick={() => navigate("/todeliver")}
            className="p-2 rounded-full hover:bg-blue-50/50 transition-all duration-300"
          >
            <img src={toDelieverIcon} alt="To Deliever" className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-blue-50/50 transition-all duration-300"
          >
            <img src={trolleyIcon} alt="Cart" className="w-6 h-6 md:w-7 md:h-7" />
            {userData?.cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {userData.cartCount}
              </span>
            )}
          </button>

          {!userData && (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 font-medium rounded-lg hover:bg-blue-50/50 transition-all duration-300"
            >
              <strong>Login</strong> <img src={assets.arrow_icon} alt="arrow" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Icons */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Cart button for mobile */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-blue-50/50 transition-all duration-300"
          >
            <img src={trolleyIcon} alt="Cart" className="w-6 h-6" />
            {userData?.cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {userData.cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-0 left-0 w-full h-full bg-white/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out ${
        showMobileMenu ? "translate-x-0" : "-translate-x-full"
      }`} style={{ marginTop: "80px" }}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {navItems.map((item, index) => {
              if (item.condition === false) return null;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      navigate(item.path);
                    }
                    setShowMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 text-blue-700 hover:text-blue-900 font-medium rounded-lg transition-all duration-300 hover:bg-blue-50/50"
                  dangerouslySetInnerHTML={{ __html: item.name }}
                />
              );
            })}

            {/* Mobile action buttons */}
            <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate("/stockeur");
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300"
              >
                <img src={stockIcon} alt="Stock" className="w-5 h-5" />
                <span>المخزنون</span>
              </button>

              <button
                onClick={() => {
                  navigate("/todeliver");
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300"
              >
                <img src={toDelieverIcon} alt="To Deliever" className="w-5 h-5" />
                <span>التوصيل</span>
              </button>
            </div>

            {!userData && (
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 mt-4"
              >
                <strong>Login</strong> <img src={assets.arrow_icon} alt="arrow" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-500 ease-in-out z-40 ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ marginTop: "80px" }}
      >
        <div className="p-5 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={toggleCart}
              className="text-blue-500 hover:text-blue-700 text-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
          <CartPage />
        </div>
      </div>

      {/* Overlays */}
      {(showCart || showMobileMenu) && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => {
            setShowCart(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;