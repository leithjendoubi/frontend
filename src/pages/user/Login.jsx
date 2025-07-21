import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData, userData } = useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp");
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleVerificationProcess = async () => {
    setIsLoading(true);
    try {
      const otpResponse = await sendVerificationOtp();
      if (otpResponse.success) {
        navigate("/email-verify");
        toast.success(otpResponse.message);
      } else {
        toast.error(otpResponse.message);
      }
    } catch (error) {
      toast.error(error.message || "فشل إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    axios.defaults.withCredentials = true;

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          await getUserData();
          await handleVerificationProcess();
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();

          if (userData && !userData.isAccountVerified) {
            await handleVerificationProcess();
          } else {
            navigate("/Home");
          }
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex arabic-text items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-200 to-white-400">
      {/* Logo - Fixed positioning for mobile */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-10">
        <img
          onClick={() => navigate("/")}
          src={assets.elfirma}
          alt="شعار"
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 cursor-pointer hover:scale-105 transition-transform"
        />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <div className="bg-slate-900 arabic-text p-6 sm:p-8 lg:p-10 rounded-xl shadow-2xl text-indigo-300">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl arabic-text font-semibold text-white mb-2 sm:mb-3">
              {state === "Sign Up" ? "إنشاء حساب" : "تسجيل الدخول"}
            </h2>

            <p className="text-sm sm:text-base arabic-text text-gray-300">
              {state === "Sign Up"
                ? "أنشئ حسابك الخاص"
                : "سجل الدخول إلى حسابك!"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-4 sm:space-y-5">
            {state === "Sign Up" && (
              <div className="flex items-center gap-3 w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#333A5C] border border-gray-600 focus-within:border-indigo-400 transition-colors">
                <img 
                  src={assets.person_icon} 
                  alt="أيقونة الشخص" 
                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                />
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="bg-transparent outline-none flex-1 text-sm sm:text-base placeholder-gray-400"
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
            )}
            
            <div className="flex items-center gap-3 w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#333A5C] border border-gray-600 focus-within:border-indigo-400 transition-colors">
              <img 
                src={assets.mail_icon} 
                alt="أيقونة البريد" 
                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="bg-transparent outline-none flex-1 text-sm sm:text-base placeholder-gray-400"
                type="email"
                placeholder="البريد الإلكتروني"
                required
              />
            </div>
            
            <div className="flex items-center gap-3 w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-[#333A5C] border border-gray-600 focus-within:border-indigo-400 transition-colors">
              <img 
                src={assets.lock_icon} 
                alt="أيقونة القفل" 
                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="bg-transparent outline-none flex-1 text-sm sm:text-base placeholder-gray-400"
                type="password"
                placeholder="كلمة المرور"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="text-indigo-400 hover:text-indigo-300 text-sm sm:text-base transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? "جاري المعالجة..." : state === "Sign Up" ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </form>

          {/* Toggle State */}
          <div className="text-center mt-6 sm:mt-8">
            {state === "Sign Up" ? (
              <p className="text-gray-400 text-xs sm:text-sm">
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => setState("Login")}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer underline transition-colors"
                >
                  سجل الدخول هنا
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-xs sm:text-sm">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => setState("Sign Up")}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer underline transition-colors"
                >
                  أنشئ حسابًا
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;