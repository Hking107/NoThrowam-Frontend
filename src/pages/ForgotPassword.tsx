import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Logo } from "../components/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await authService.sendOTP(email, "PASSWORD_RESET");
      setSuccess(true);
      // Store email for reset password page
      sessionStorage.setItem("pending_email", email);
      setTimeout(() => navigate("/reset-password", { state: { email } }), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="auth-card w-full max-w-lg relative z-10">
        <div className="card-tactile !p-8 md:!p-12">
          {/* Back Button */}
          <button
            onClick={() => navigate("/signin")}
            className="auth-item absolute top-8 left-8 p-2 rounded-full hover:bg-black/5 text-brand-text/40 hover:text-brand-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col items-center mb-10 mt-4">
            <div className="auth-item mb-6">
              <Logo />
            </div>
            <h2 className="auth-item text-3xl font-extrabold text-brand-text text-center tracking-tight">
              Reset Password
            </h2>
            <p className="auth-item text-brand-text/60 text-center mt-2 font-medium">
              Enter your email to receive a verification code
            </p>
          </div>

          {error && (
            <div className="auth-item mb-6 p-4 bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-2xl text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
              {error}
            </div>
          )}

          {success ? (
            <div className="auth-item text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-text">
                Check your email
              </h3>
              <p className="text-brand-text/60 font-medium leading-relaxed">
                We've sent a 6-digit verification code to <br />
                <span className="text-brand-green font-bold">{email}</span>
              </p>
              <p className="text-xs text-brand-text/40 animate-pulse">
                Redirecting you to reset page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="auth-item">
                <label className="block text-sm font-bold text-brand-text/60 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-14 px-5 pr-14 rounded-full border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
                  />
                  <Mail
                    size={20}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-text/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="auth-item w-full btn-primary py-4! flex items-center justify-center gap-3 text-lg group shadow-xl hover:shadow-brand-green/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <Send
                      size={18}
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-item mt-10 text-center">
            <p className="text-brand-text/60 font-medium">
              Remember your password?{" "}
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
};
