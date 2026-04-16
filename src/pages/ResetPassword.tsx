import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Eye, EyeOff, CheckCircle2, ArrowLeft, RefreshCw, Timer, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "../components/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = (location.state as any)?.email || "";

    const [email, setEmail] = useState<string>(
        emailFromState || sessionStorage.getItem("pending_email") || ""
    );

    const [step, setStep] = useState<"otp" | "password" | "success">("otp");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Timers for expiry and resend
    const [countdown, setCountdown] = useState<number>(600);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [canResend, setCanResend] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();
        
        tl.fromTo(".auth-card", 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(".auth-item", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 
            "-=0.4"
        );
    }, { scope: containerRef, dependencies: [step] });

    useEffect(() => {
        if (!email) return;
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, email]);

    useEffect(() => {
        if (resendCooldown <= 0) {
            setCanResend(true);
            return;
        }
        const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleResend = async () => {
        if (!email) return;
        setError("");
        setCanResend(false);
        setResendCooldown(60);
        try {
            await authService.sendOTP(email, "PASSWORD_RESET");
            setCountdown(600);
        } catch (err: any) {
            setCanResend(true);
            setResendCooldown(0);
            setError(err.message || "Failed to resend code. Try again later.");
        }
    };

    const handleOtpNext = (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        if (!email) {
            setError("Missing email. Please start again.");
            return;
        }
        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit code sent to your email");
            return;
        }
        setStep("password");
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Missing email. Please start again.");
            return;
        }

        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit code sent to your email");
            setStep("otp");
            return;
        }

        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await authService.validateNewPassword(email, otp, password);
            sessionStorage.removeItem("pending_email");
            setStep("success");
            setTimeout(() => navigate("/signin"), 2500);
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.");
            setStep("otp");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-surface p-6">
                <div className="card-tactile text-center max-w-md">
                    <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
                        <ArrowLeft size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-text mb-4">Reset Flow Not Started</h1>
                    <p className="text-brand-text/60 mb-8 font-medium">Please request a password reset first.</p>
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="btn-primary w-full"
                    >
                        Start Reset
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-brand-surface p-6 relative overflow-hidden">
            {/* Decorative Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="auth-card w-full max-w-lg relative z-10">
                <div className="card-tactile !p-8 md:!p-12">
                    {/* Back Button */}
                    <button 
                        onClick={() => step === "password" ? setStep("otp") : navigate("/forgot-password")}
                        className="auth-item absolute top-8 left-8 p-2 rounded-full hover:bg-black/5 text-brand-text/40 hover:text-brand-text transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col items-center mb-10 mt-4">
                        <div className="auth-item mb-6">
                            <Logo />
                        </div>
                        <h2 className="auth-item text-3xl font-extrabold text-brand-text text-center tracking-tight">
                            {step === "success" ? "All Set!" : "New Password"}
                        </h2>
                        <p className="auth-item text-brand-text/60 text-center mt-2 font-medium">
                            {step === "otp" && `Verify the code sent to ${email}`}
                            {step === "password" && "Secure your account with a new password"}
                            {step === "success" && "Your password has been reset successfully"}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-item mb-6 p-4 bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-2xl text-sm font-medium flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                            {error}
                        </div>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleOtpNext} className="space-y-8">
                            <div className="auth-item">
                                <label className="block text-sm font-bold text-brand-text/60 mb-4 text-center uppercase tracking-widest">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000 000"
                                    className="w-full h-20 text-center text-4xl font-black px-4 rounded-2xl border border-black/5 bg-brand-surface focus:ring-8 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all tracking-[0.5em] text-brand-text placeholder:text-brand-text/5"
                                />
                            </div>

                            <div className="auth-item flex items-center justify-between px-6 py-4 bg-brand-surface border border-black/5 rounded-2xl">
                                <div className="flex items-center gap-3 text-brand-text/60 font-medium">
                                    <Timer size={18} />
                                    <span className="text-sm">Expires in</span>
                                </div>
                                <span className={`text-xl font-bold ${countdown < 60 ? "text-brand-red animate-pulse" : "text-brand-green"}`}>
                                    {formatTime(countdown)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length !== 6}
                                className="auth-item w-full btn-primary !py-4 flex items-center justify-center gap-3 text-lg font-bold shadow-xl hover:shadow-brand-green/20"
                            >
                                <span>Continue</span>
                                <ShieldCheck size={20} />
                            </button>

                            <div className="auth-item mt-8 pt-8 border-t border-black/5 text-center">
                                <p className="text-brand-text/60 font-medium mb-4">Didn't receive the code?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={!canResend}
                                    className="flex items-center justify-center gap-2 mx-auto text-brand-green font-bold hover:underline disabled:text-brand-text/20 disabled:cursor-not-allowed transition-all group"
                                >
                                    <RefreshCw size={18} className={`${!canResend ? "" : "group-hover:rotate-180"} transition-transform duration-500`} />
                                    <span>{canResend ? "Resend Code" : `Resend in ${formatTime(resendCooldown)}`}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "password" && (
                        <form onSubmit={handleFinalSubmit} className="space-y-6">
                            <div className="auth-item">
                                <label className="block text-sm font-bold text-brand-text/60 mb-2 ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Min. 8 characters"
                                        className="w-full h-14 px-5 pr-14 rounded-2xl border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-brand-text/30 hover:text-brand-text transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-item">
                                <label className="block text-sm font-bold text-brand-text/60 mb-2 ml-1">Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-14 px-5 rounded-2xl border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-item w-full btn-primary !py-4 flex items-center justify-center gap-3 text-lg group shadow-xl hover:shadow-brand-green/20 mt-4"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Resetting...
                                    </span>
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <Lock size={18} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="auth-item mt-6 text-sm text-brand-text/60 text-center font-medium">
                                Want to <button type="button" className="text-brand-green font-bold hover:underline" onClick={() => setStep("otp")}>enter a different code?</button>
                            </p>
                        </form>
                    )}

                    {step === "success" && (
                        <div className="auth-item text-center py-8 space-y-6">
                            <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-brand-text tracking-tight">Success!</h2>
                                <p className="text-brand-text/60 font-medium leading-relaxed">
                                    Your secure access has been restored. <br />
                                    Redirecting you to sign in...
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate("/signin")} 
                                className="btn-primary w-full"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
