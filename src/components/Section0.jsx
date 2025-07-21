import React, { useState, useEffect } from 'react';
import './Section0.css';
import { useNavigate } from 'react-router-dom';

const images = ['/01.jpg', '/02.jpg', '/03.jpg'];

const Section0 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fade, setFade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true); // start fading

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        setFade(false); // end fading
      }, 1000); // match CSS transition duration
    }, 6000);

    return () => clearInterval(interval);
  }, [nextIndex]);

  return (
    <section id="section0" className="section0 relative">
      {/* Two layered background images with zoom-out animation */}
      <div
        className="bg-image zoom-out"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          opacity: fade ? 0 : 1,
        }}
      />
      <div
        className="bg-image-next zoom-out"
        style={{
          backgroundImage: `url(${images[nextIndex]})`,
          opacity: fade ? 1 : 0,
        }}
      />

      {/* Overlay content */}
      <div className="overlay-card arabic-text">
        <h1 className="firma-title arabic-text">فيرمة</h1>
        <p className="firma-subtitle arabic-text ">مرحبا بيك في فيرمة !</p>
        <p className="firma-des arabic-text">
          أول مسلك تجاري إلكتروني للمنتجات الفلاحية موافق لمعايير الدولة التونسية
        </p>
        <button className="start-btn" onClick={() => navigate('/login')}>
          هيا نبداو
        </button>
      </div>
    </section>
  );
};

export default Section0;
