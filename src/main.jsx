import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/sidebar.jsx";
import Home1 from "./pages/firstpage.jsx"; 
import Login from "./pages/user/Login.jsx";
import EmailVerify from "./pages/user/EmailVerify.jsx";
import ResetPassword from "./pages/user/ResetPassword.jsx";

// Layout wrapper to conditionally render Navbar/Sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {!isHomePage && (
        <>
          <Navbar />
          <Sidebar />
        </>
      )}
      <div style={{ paddingTop: isHomePage ? "0" : "100px" }}>
        {children}
      </div>
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <Routes>
        {/* Homepage (no Navbar/Sidebar) */}
        <Route path="/" element={<Home1 />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />        

        {/* All other routes (with Navbar/Sidebar) */}
        <Route
          path="*"
          element={
            <Layout>
              <App />
            </Layout>
          }
        />
      </Routes>
    </AppContextProvider>
  </BrowserRouter>
);