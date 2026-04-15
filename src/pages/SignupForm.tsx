import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Logo } from "../components/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export interface SignupFormProps {
  role: "SELLER" | "CUSTOMER" | "MANAGER";
  roleName: string;
}

export function SignupForm({ role, roleName }: SignupFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".auth-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        ".auth-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.4",
      );
    },
    { scope: containerRef },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Email and password are required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        role: role,
      };

      await authService.register(payload);

      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: { email: formData.email, isSignup: true },
      });
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred during registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-brand-surface p-6 relative overflow-hidden"
    >
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="auth-card w-full max-w-lg relative z-10">
        <div className="card-tactile !p-8 md:!p-12">
          {/* Back Button */}
          <button
            onClick={() => navigate("/signup")}
            className="auth-item absolute top-8 left-8 p-2 rounded-full hover:bg-black/5 text-brand-text/40 hover:text-brand-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col items-center mb-10 mt-4">
            <div className="auth-item mb-6">
              <Logo />
            </div>
            <h2 className="auth-item text-3xl font-extrabold text-brand-text text-center tracking-tight">
              {roleName} Registration
            </h2>
            <p className="auth-item text-brand-text/60 text-center mt-2 font-medium">
              Create your account to join the community
            </p>
          </div>

          {error && (
            <div className="auth-item mb-6 p-4 bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-2xl text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="auth-item">
              <label className="block text-sm font-bold text-brand-text/60 mb-2 ml-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-14 px-5 rounded-full border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
              />
            </div>

            <div className="auth-item">
              <label className="block text-sm font-bold text-brand-text/60 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-14 px-5 rounded-full border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
              />
            </div>

            <div className="auth-item grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-brand-text/60 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-14 px-5 pr-14 rounded-full border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-brand-text/30 hover:text-brand-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-brand-text/60 ml-1">
                  Confirm
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full h-14 px-5 rounded-full border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-item w-full btn-primary py-4! flex items-center justify-center gap-3 text-lg group shadow-xl hover:shadow-brand-green/20 mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="auth-item mt-10 text-center">
            <p className="text-brand-text/60 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-brand-green font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
