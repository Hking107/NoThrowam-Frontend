import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || sessionStorage.getItem("pending_email");
  const isSignup = location.state?.isSignup || false;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Access
          </h1>
          <p className="text-gray-600 mb-6">
            Please start the signup or login process again.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6 && otp.length !== 0) {
      setError("OTP must be 6 digits");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Get user role for redirect
        const role = sessionStorage.getItem("pending_role");
        if (role === "CUSTOMER") {
          navigate("/dashboard_customer");
        } else if (role === "SELLER") {
          navigate("/dashboard_seller");
        } else if (role === "MANAGER") {
          navigate("/manager");
        } else {
          navigate("/");
        }
      } else {
        // Password reset flow - navigate to reset password page
        navigate("/reset-password", { state: { email } });
      }
    } catch (err: any) {
      setError(
        err.message ||
          "OTP verification failed. Please try again or request a new OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setCanResend(false);
    setResendCooldown(60);

    try {
      await authService.sendOTP(
        email,
        isSignup ? "SIGNUP" : "PASSWORD_RESET"
      );
      setOtp("");
      setCountdown(600);
    } catch (err: any) {
      setCanResend(true);
      setResendCooldown(0);
      setError(err.message || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a verification code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="w-full h-14 text-center text-2xl font-bold px-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all tracking-widest"
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-700">Code expires in:</span>
            <span
              className={`text-lg font-bold ${
                countdown < 60 ? "text-red-600" : "text-blue-600"
              }`}
            >
              {formatTime(countdown)}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={!canResend}
            className="text-indigo-600 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition"
          >
            {canResend
              ? "Resend Code"
              : `Resend in ${resendCooldown}s`}
          </button>
        </div>
      </div>
    </div>
  );
}
