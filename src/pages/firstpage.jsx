import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import Section0 from '../components/Section0';

const Home1 = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-50 items-center justify-between w-[85%] px-10 py-4 bg-black bg-opacity-50 text-white rounded-full z-10">
        {/* Left Side: Logo + Brand Name */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Firma Logo" className="h-20" />
          <span className="arabic-text text-4xl">فيرمة</span>
        </div>

        {/* Right Side: Nav Links + Button */}
        <div className="flex items-center gap-8">
          <ul className="flex gap-8 font-medium text-lg">
            <li><a href="#section0" className="hover:text-yellow-400 arabic-text">مرحباً</a></li>
            <li><a href="#section1" className="hover:text-yellow-400 arabic-text">من نحن</a></li>
            <li><a href="#section2" className="hover:text-yellow-400 arabic-text">خدماتنا</a></li>
            <li><a href="#section3" className="hover:text-yellow-400 arabic-text">عملاؤنا</a></li>
            <li><a href="#section4" className="hover:text-yellow-400 arabic-text">اتصل بنا</a></li>
          </ul>
          <Link
            to="/login"
            className="border border-white rounded-full px-6 py-2 text-base hover:bg-white hover:text-black transition duration-300"
          >
            هيا نبداو →
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Firma Logo" className="h-12" />
            <span className="arabic-text text-xl text-white">فيرمة</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="border border-white rounded-full px-4 py-1.5 text-sm text-white hover:bg-white hover:text-black transition duration-300"
            >
              دخول
            </Link>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="px-4 pb-4 border-t border-white/20">
            <ul className="flex flex-col space-y-3 pt-3">
              <li><a href="#section0" className="block text-white hover:text-yellow-400 arabic-text text-center py-2" onClick={() => setShowMobileMenu(false)}>مرحباً</a></li>
              <li><a href="#section1" className="block text-white hover:text-yellow-400 arabic-text text-center py-2" onClick={() => setShowMobileMenu(false)}>من نحن</a></li>
              <li><a href="#section2" className="block text-white hover:text-yellow-400 arabic-text text-center py-2" onClick={() => setShowMobileMenu(false)}>خدماتنا</a></li>
              <li><a href="#section3" className="block text-white hover:text-yellow-400 arabic-text text-center py-2" onClick={() => setShowMobileMenu(false)}>عملاؤنا</a></li>
              <li><a href="#section4" className="block text-white hover:text-yellow-400 arabic-text text-center py-2" onClick={() => setShowMobileMenu(false)}>اتصل بنا</a></li>
            </ul>
          </div>
        )}
      </nav>

      {/* Section 0 */}
      <Section0 />

      {/* Section 1 */}
      <section id="section1" className="min-h-screen flex flex-col">
        {/* Section content */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Left side (white with card) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 lg:p-8">
            <div className="w-48 h-48 sm:w-64 sm:h-64 perspective">
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d hover:rotate-y-180">
                {/* Front */}
                <div className="absolute w-full h-full bg-white text-blue-900 flex flex-col items-center justify-center backface-hidden shadow-md rounded">
                  <p className="font-bold text-lg">FLIP CARD</p>
                  <p>Hover Me</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full bg-white text-blue-900 flex flex-col items-center justify-center rotate-y-180 backface-hidden shadow-md rounded">
                  <p className="font-bold text-lg">BACK</p>
                  <p>Leave Me</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side (navy) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-blue-900 text-white px-6 lg:px-12 py-8 lg:py-0 text-center text-base lg:text-lg">
            <p>
              <strong className="text-xl lg:text-2xl block mb-4 lg:mb-2">Introduction</strong>
              Firma est une initiative développée par des ingénieurs tunisiens de l'entreprise Clediss. Son objectif est de moderniser et organiser le marché agricole et de la pêche en Tunisie, conformément aux normes de l'État. Ce projet vise à :
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="section2" className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-blue-900 text-white flex items-center justify-center px-6 lg:px-12 py-8 lg:py-0 text-center text-base lg:text-lg">
          <p>
            <strong className="text-xl lg:text-2xl block mb-4 lg:mb-2">Introduction</strong>
            Firma est une initiative développée par des ingénieurs tunisiens de l'entreprise Clediss. Son objectif est de moderniser et organiser le marché agricole et de la pêche en Tunisie, conformément aux normes de l'État. Ce projet vise à :
          </p>
        </div>

        {/* Right - video */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 lg:p-8">
          <div className="border-4 border-blue-500 p-2 lg:p-4 rounded-lg shadow-md w-full max-w-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto max-h-[400px] lg:max-h-[600px] object-cover rounded"
            >
              <source src="/market.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="section3" className="min-h-screen bg-blue-100 flex flex-col items-center justify-center px-4 lg:px-8 py-8 lg:py-0 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-blue-800 mb-4">Contact Us</h2>
        <p className="text-blue-700 max-w-xl mb-6 text-sm lg:text-base">
          Pour toute question ou demande de collaboration, n'hésitez pas à nous contacter.
        </p>
        <form className="w-full max-w-md flex flex-col gap-4">
          <input className="p-3 border border-blue-300 rounded text-sm lg:text-base" type="text" placeholder="Your Name" />
          <input className="p-3 border border-blue-300 rounded text-sm lg:text-base" type="email" placeholder="Your Email" />
          <textarea className="p-3 border border-blue-300 rounded text-sm lg:text-base" rows="4" placeholder="Your Message" />
          <button className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-900 transition-colors text-sm lg:text-base" type="submit">Send</button>
        </form>
      </section>
    </div>
  );
};

export default Home1;
