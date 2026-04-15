import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "../components/Logo";
import { CheckCircle2, ArrowLeft, RefreshCw, Timer } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();
  const email =
    location.state?.email || sessionStorage.getItem("pending_email");
  const isSignup = location.state?.isSignup || false;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-6">
        <div className="card-tactile text-center max-w-md">
          <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft size={32} />
          </div>
          <h1 className="text-2xl font-bold text-brand-text mb-4">
            Invalid Access
          </h1>
          <p className="text-brand-text/60 mb-8 font-medium">
            Please start the signup or login process again.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="btn-primary w-full"
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
      await verifyOTP(email, otp);
      if (isSignup) {
        const role = localStorage.getItem("user_role");
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
        navigate("/reset-password", { state: { email } });
      }
    } catch (err: any) {
      setError(
        err.message ||
          "OTP verification failed. Please try again or request a new OTP.",
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
      await authService.sendOTP(email, isSignup ? "SIGNUP" : "PASSWORD_RESET");
      setOtp("");
      setCountdown(600);
    } catch (err: any) {
      setCanResend(true);
      setResendCooldown(0);
      setError(err.message || "Failed to resend OTP. Please try again.");
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
        <div className="card-tactile p-8! md:p-12!">
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
              Verify Email
            </h2>
            <p className="auth-item text-brand-text/60 text-center mt-2 font-medium">
              We've sent a 6-digit code to{" "}
              <span className="text-brand-green">{email}</span>
            </p>
          </div>

          {error && (
            <div className="auth-item mb-6 p-4 bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-2xl text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="auth-item">
              <label className="block text-sm font-bold text-brand-text/60 mb-4 text-center uppercase tracking-widest">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000 000"
                className="w-full h-20 text-center text-4xl font-black px-4 rounded-2xl border border-black/5 bg-brand-surface focus:ring-8 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all tracking-[0.5em] text-brand-text placeholder:text-brand-text/5"
              />
            </div>

            {/* Timer Section */}
            <div className="auth-item flex items-center justify-between px-6 py-4 bg-brand-surface border border-black/5 rounded-2xl">
              <div className="flex items-center gap-3 text-brand-text/60 font-medium">
                <Timer size={18} />
                <span className="text-sm">Expires in</span>
              </div>
              <span
                className={`text-xl font-bold ${
                  countdown < 60
                    ? "text-brand-red animate-pulse"
                    : "text-brand-green"
                }`}
              >
                {formatTime(countdown)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="auth-item w-full btn-primary py-4! flex items-center justify-center gap-3 text-lg group shadow-xl hover:shadow-brand-green/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Verify Account</span>
                  <CheckCircle2
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="auth-item mt-12 pt-8 border-t border-black/5 text-center">
            <p className="text-brand-text/60 font-medium mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="flex items-center justify-center gap-2 mx-auto text-brand-green font-bold hover:underline disabled:text-brand-text/20 disabled:cursor-not-allowed transition-all group"
            >
              <RefreshCw
                size={18}
                className={`${!canResend ? "" : "group-hover:rotate-180"} transition-transform duration-500`}
              />
              <span>
                {canResend
                  ? "Resend New Code"
                  : `Resend in ${formatTime(resendCooldown)}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
