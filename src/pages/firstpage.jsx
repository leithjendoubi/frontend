import React from 'react';
import { Link } from 'react-router-dom'; 
import Section0 from '../components/Section0';

const Home1 = () => {
  return (
    <div className="w-full">

      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between w-[85%] px-10 py-4 bg-black bg-opacity-50 text-white rounded-full z-10">
        {/* Left Side: Logo + Brand Name */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Firma Logo" className="h-20" />
          <span className="arabic-text text-4xl">فيرمة</span>
        </div>

        {/* Right Side: Nav Links + Button */}
        <div className="flex items-center gap-8">
          <ul className="flex gap-8 font-medium text-lg">
            <li><a href="#section0" className="hover:text-yellow-400">Welcome</a></li>
            <li><a href="#section1" className="hover:text-yellow-400">About</a></li>
            <li><a href="#section2" className="hover:text-yellow-400">Services</a></li>
            <li><a href="#section3" className="hover:text-yellow-400">Clients</a></li>
            <li><a href="#section4" className="hover:text-yellow-400">Contact</a></li>
          </ul>
          <Link
            to="/login"
            className="border border-white rounded-full px-6 py-2 text-base hover:bg-white hover:text-black transition duration-300"
          >
            Start →
          </Link>
        </div>
      </nav>

      {/* Section 0 */}
      <Section0 />

      {/* Section 1 */}
      <section id="section1" className="min-h-screen flex flex-col">
        

        {/* Section content */}
        <div className="flex flex-1">
          {/* Left side (white with card) */}
          <div className="w-1/2 flex items-center justify-center bg-white">
            <div className="w-64 h-64 perspective">
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
          <div className="w-1/2 flex items-center justify-center bg-blue-900 text-white px-12 text-center text-lg">
            <p>
              <strong className="text-xl block mb-2">Introduction</strong>
              Firma est une initiative développée par des ingénieurs tunisiens de l’entreprise Clediss. Son objectif est de moderniser et organiser le marché agricole et de la pêche en Tunisie, conformément aux normes de l'État. Ce projet vise à :
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="section2" className="min-h-screen flex">
        <div className="w-1/2 bg-blue-900 text-white flex items-center justify-center px-12 text-center text-lg">
          <p>
            <strong className="text-xl block mb-2">Introduction</strong>
            Firma est une initiative développée par des ingénieurs tunisiens de l’entreprise Clediss. Son objectif est de moderniser et organiser le marché agricole et de la pêche en Tunisie, conformément aux normes de l'État. Ce projet vise à :
          </p>
        </div>

        {/* Right - video */}
        <div className="w-1/2 flex items-center justify-center bg-white">
          <div className="border-4 border-blue-500 p-4 rounded-lg shadow-md">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-[960px] h-[601px] object-cover rounded"
            >
              <source src="/Download (11).mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="section3" className="min-h-screen bg-blue-100 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Contact Us</h2>
        <p className="text-blue-700 max-w-xl mb-6">
          Pour toute question ou demande de collaboration, n'hésitez pas à nous contacter.
        </p>
        <form className="w-full max-w-md flex flex-col gap-4">
          <input className="p-3 border border-blue-300 rounded" type="text" placeholder="Your Name" />
          <input className="p-3 border border-blue-300 rounded" type="email" placeholder="Your Email" />
          <textarea className="p-3 border border-blue-300 rounded" rows="4" placeholder="Your Message" />
          <button className="bg-blue-800 text-white py-2 rounded hover:bg-blue-900" type="submit">Send</button>
        </form>
      </section>
    </div>
  );
};

export default Home1;
