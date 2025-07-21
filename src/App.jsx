import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import EmailVerify from "./pages/user/EmailVerify";
import ResetPassword from "./pages/user/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateProduct from "./pages/products/CreateProduct";
import Marche from "./pages/marche/Marche";
import Item from "./pages/products/Item";
import CartPage from "./pages/products/CartPage";
import AddOrder from "./pages/products/AddOrder";
import AddLivreur from "./pages/demands/addlivreur";
import DemandProducteur from "./pages/demands/demandproducteur";
import DemandVendeur from "./pages/demands/demandevendeur";
import Home1 from "./pages/firstpage";
import Map from "./pages/map/Map";
import MyProfil from "./pages/user/MyProfil";
import Market from "./pages/marche/Marchedesvendeurs";
import CreateEquipement from "./pages/stock/createequip";
import AddStockiste from "./pages/demands/addstockiste";
import Stockeur from "./pages/stock/Stockeur";
import Marcheallproducts from "./pages/marche/Marchedesproducteur";
import Livreur from "./pages/livraison/Livreurs";
import ToDeliver from "./pages/livraison/ordertodeliever";
import VendeurList from "./pages/marche/venders";
import Showproducer from "./pages/map/showproducers";
import Mandat from "./pages/marche/Mandat";
import FindStockage from "./pages/stock/findstockage";


import ShowOrderToDeliver from "./pages/livraison/showordertodeliever";
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  return (
    <div className="app-container">
      <ToastContainer />
      
      <main className="main-content">
        <Routes>
          <Route path="/CreateProduct" element={<CreateProduct/>} />
          <Route path='/product/:id' element={<Item/>} />
          <Route path='/addorder' element={<AddOrder/>}/>
          <Route path="/Home" element={<Home />} />
          <Route path="/livreurs" element={<Livreur />} />
          <Route path="/mandat" element={<Mandat />} />
          <Route path="/market" element={<Market />} />
          <Route path="/showorder" element={<ShowOrderToDeliver />} />
          <Route path="/addstockiste" element={<AddStockiste/>}/>
          <Route path="/allproducts" element={<Marcheallproducts/>}/>
          <Route path="/map" element={<Map/>}/>
          <Route path="/createequipement" element={<CreateEquipement/>}/>
          <Route path="/login" element={<Login />} />
          <Route path ="/stockeur" element={<Stockeur/>}/>
          <Route path="/home1" element={<Home1 />} />
          <Route path="/myprofil" element={<MyProfil/>}/>
          <Route path="/venderlist" element={<VendeurList/>}/>
          <Route path="/" element={<Home1 />} />
          <Route path="/demandproducteur" element={<DemandProducteur />} />
          <Route path="/findStockage" element={<FindStockage />} />
          <Route path="/demandvendeur" element={<DemandVendeur />} />                      
          <Route path="/addlivreur" element={<AddLivreur/>}/>
          <Route path="/Marche" element={<Marche />} />       
          <Route path="/CartPage" element={<CartPage />} />
          <Route path="/showmap" element={<Showproducer />} />          
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/todeliver" element={<ToDeliver />} />          
        </Routes>
      </main>
    </div>
  );
};

export default App;