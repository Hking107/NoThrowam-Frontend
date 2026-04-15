import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Eye, EyeClosed } from "lucide-react";

export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = (location.state as any)?.email || "";

    const [email, setEmail] = useState<string>(
        emailFromState || sessionStorage.getItem("reset_email") || ""
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

    useEffect(() => {
        if (!email) return;
        // start countdown only if there is an email
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

        // Move to password step. Final validation will be done by the backend.
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
            sessionStorage.removeItem("reset_email");
            setStep("success");
            // Redirect to sign in shortly
            setTimeout(() => navigate("/signin"), 2500);
        } catch (err: any) {
            // If OTP invalid/expired, go back to otp step and show message
            setError(err.message || "Failed to reset password. Please try again.");
            setStep("otp");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Reset Flow Not Started</h1>
                    <p className="text-gray-600 mb-6">Please request a password reset first.</p>
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Start Reset
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
                    <p className="text-gray-600 text-sm">We sent a code to <span className="font-semibold">{email}</span></p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
                )}

                {step === "otp" && (
                    <form onSubmit={handleOtpNext} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit Code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                className="w-full h-12 text-center text-2xl font-bold px-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest"
                            />
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-gray-700">Code expires in:</span>
                            <span className={`text-lg font-bold ${countdown < 60 ? "text-red-600" : "text-blue-600"}`}>
                                {formatTime(countdown)}
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
                            <button
                                onClick={handleResend}
                                disabled={!canResend}
                                className="text-indigo-600 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {canResend ? "Resend Code" : `Resend in ${formatTime(resendCooldown)}s`}
                            </button>
                        </div>
                    </form>
                )}

                {step === "password" && (
                    <form onSubmit={handleFinalSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="At least 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <p className="mt-3 text-sm text-gray-600 text-center">
                            Or <button type="button" className="text-indigo-600 font-semibold hover:underline" onClick={() => setStep("otp")}>enter a different code</button>
                        </p>
                    </form>
                )}

                {step === "success" && (
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful</h2>
                        <p className="text-gray-600 mb-4">You will be redirected to sign in shortly.</p>
                        <button onClick={() => navigate("/signin")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Go to Sign In</button>
                    </div>
                )}
            </div>
        </div>
    );
};
