import React, { useState } from "react";
import { Eye, EyeOff, MapPin } from "lucide-react";

export const Customer_SI = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    company_name: "",
    waste_type: "",
    password: "",
    confirm_password: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const wasteTypes = [
    { id: 1, name: "Plastic Waste" },
    { id: 2, name: "Organic Waste" },
    { id: 3, name: "Metal Waste" },
    { id: 4, name: "Electronic Waste" },
  ];

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please allow location access");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://your-api-endpoint.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed");

      alert("Registration successful 🎉");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-lg backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/40">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Customer Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join us and start managing your waste efficiently ♻️
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

          {/* Company Name */}
          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />

          {/* Waste Type */}
          <select
            name="waste_type"
            value={formData.waste_type}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="">Select Waste Type</option>
            {wasteTypes.map((waste) => (
              <option key={waste.id} value={waste.name}>
                {waste.name}
              </option>
            ))}
          </select>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
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
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <MapPin size={18} />
            Get My Location
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};