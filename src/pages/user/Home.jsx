import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Sidebar from "../../components/sidebar";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/background11.mp4" type="video/mp4" />
      </video>
     <Sidebar/>
      <Navbar />
      <Header />
    </div>
  );
};

export default Home;
