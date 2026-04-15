import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      // Persist email for the reset flow and navigate to OTP step
      sessionStorage.setItem("reset_email", email);
      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <div className="w-full max-w-lg backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password</h2>
        <p className="text-center text-gray-600 mb-6">Enter your account email to receive a reset code.</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Requesting..." : "Send Reset Code"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Remembered your password?{' '}
          <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/signin')}>Sign in</span>
        </p>
      </div>
    </div>
  );
};
