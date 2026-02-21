import React, { useState } from "react";
import { Eye, EyeOff, MapPin } from "lucide-react";

export const Seller_SI = () => {
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    passcode: "",
    confirm_passcode: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
      },
      (error) => {
        alert("Unable to retrieve your location: " + error.message);
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.passcode !== formData.confirm_passcode) {
      setError("Passcodes do not match");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please allow location access");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Replace with your real endpoint
      const response = await fetch("https://your-api-endpoint.com/seller-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed");

      alert("Seller account created successfully 🎉");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <div className="w-full max-w-lg backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/40">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Seller Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Start selling and manage your products easily 🛍️
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />

          {/* Passcode */}
          <div className="relative">
            <input
              type={showPasscode ? "text" : "password"}
              name="passcode"
              placeholder="Passcode"
              value={formData.passcode}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Passcode */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm_passcode"
              placeholder="Confirm Passcode"
              value={formData.confirm_passcode}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Location Button */}
          <button
            type="button"
            onClick={getLocation}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <MapPin size={18} />
            Get Seller Location
          </button>

          {formData.latitude && (
            <p className="text-sm text-green-600 text-center">
              📍 Location captured successfully
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#011753] hover:bg-indigo-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Seller Account"}
          </button>
        </form>
      </div>
    </div>
  );
};