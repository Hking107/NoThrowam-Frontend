import { useNavigate } from "react-router-dom";
// import cameroonImage from "../assets/istockphoto-1408969578-612x612.webp";
import Carosel from "../components/caroussl";
import MobileCarousel from "../components/mobile";
export function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 relative overflow-hidden">
     
      <Carosel/>
      <MobileCarousel/>

      {/* Signup Card */}
      <div className="w-full md:w-1/2 max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center">
          Create Your Account
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Join the platform to manage waste disposal efficiently.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/seller")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-green-600 hover:to-teal-600 transition duration-300"
          >
            Sign Up as Seller
          </button>
          <button
            onClick={() => navigate("/customer")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-yellow-500 hover:to-orange-600 transition duration-300"
          >
            Sign Up as Customer
          </button>
          <button
            onClick={() => navigate("/manager")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-purple-600 hover:to-indigo-600 transition duration-300"
          >
            Sign Up as Manager
          </button>
        </div>

        <p className="mt-6 text-gray-400 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}
          >
            Log in
          </span>
        </p>
      </div>

      {/* Optional floating elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
  );
}