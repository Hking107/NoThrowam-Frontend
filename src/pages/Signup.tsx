import { useNavigate } from "react-router-dom";

export function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 relative overflow-hidden">
      {/* Signup Card */}
      <div className="w-full md:w-1/2 max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Join NoThrowam
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Choose your role to get started
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/signup/seller")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-green-600 hover:to-teal-600 transition duration-300"
          >
            Sign Up as Seller
          </button>
          <button
            onClick={() => navigate("/signup/customer")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-yellow-500 hover:to-orange-600 transition duration-300"
          >
            Sign Up as Customer
          </button>
          <button
            onClick={() => navigate("/signup/manager")}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg transform hover:scale-105 hover:from-purple-600 hover:to-indigo-600 transition duration-300"
          >
            Sign Up as Manager
          </button>
        </div>

        <p className="mt-6 text-gray-600 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
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