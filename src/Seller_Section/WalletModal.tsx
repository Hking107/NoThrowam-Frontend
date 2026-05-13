import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  X,
  ArrowDownCircle,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  withdrawalService,
  type SellerPayment,
  type WithdrawalConfirmResponse,
} from "../services/withdrawalService";

interface WalletModalProps {
  onClose: () => void;
  balance?: number;
  sellerId?: number;
  payments?: SellerPayment[];
}

type WithdrawalStep = "AMOUNT" | "OTP" | "SUCCESS" | "PROCESSING";
type WithdrawalOperator = "MTN_Cameroon" | "Orange_Cameroon";

const WalletModal: React.FC<WalletModalProps> = ({
  onClose,
  balance = 0,
  sellerId,
  payments,
}) => {
  // Navigation State
  const [step, setStep] = useState<WithdrawalStep>("AMOUNT");
  
  // Form State
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [operator, setOperator] = useState<WithdrawalOperator>("MTN_Cameroon");
  
  // OTP State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState<string[]>(new Array(6).fill(""));
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<SellerPayment[]>([]);
  const [confirmationData, setConfirmationData] =
    useState<WithdrawalConfirmResponse | null>(null);

  // Load transaction history
  useEffect(() => {
    if (payments) {
      setTransactions(payments);
      return;
    }

    if (!sellerId) return;

    const loadHistory = async () => {
      try {
        const history = await withdrawalService.getSellerPayments(sellerId);
        setTransactions(history);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    loadHistory();
  }, [payments, sellerId]);

  const getNormalizedPhoneNumber = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.startsWith("237")) return digits;
    return `237${digits}`;
  };

  // Step 1: Initiate Withdrawal
  const handleInitiate = async () => {
    setError(null);
    const amount = parseFloat(withdrawalAmount);
    const normalizedPhoneNumber = getNormalizedPhoneNumber();
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amount > balance) {
      setError(`Insufficient balance. Available: ${balance.toLocaleString()} FCFA`);
      return;
    }
    if (!/^2376\d{8}$/.test(normalizedPhoneNumber)) {
      setError("Please enter a valid Cameroon mobile money phone number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await withdrawalService.initiate({
        amount: amount.toFixed(2),
        phone_number: normalizedPhoneNumber,
        operator,
      });
      setChallengeId(response.challenge_id);
      setOtpValue(new Array(6).fill(""));
      setStep("OTP");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate withdrawal.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm Withdrawal
  const handleConfirm = async (forcedOtp?: string) => {
    setError(null);
    const code = forcedOtp || otpValue.join("");
    if (code.length < 6) return;
    if (!challengeId) {
      setError("Withdrawal challenge missing. Please restart the withdrawal.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await withdrawalService.confirm({
        challenge_id: challengeId,
        otp_code: code,
      });
      
      setConfirmationData(response);
      if (
        response.statusCode === 202 ||
        response.detail.toLowerCase().includes("processing")
      ) {
        setStep("PROCESSING");
      } else {
        setStep("SUCCESS");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      // Clear OTP on error
      setOtpValue(new Array(6).fill(""));
      otpInputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValue(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit
    if (newOtp.every(v => v !== "") && index === 5) {
      handleConfirm(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleBackToAmount = () => {
    setStep("AMOUNT");
    setChallengeId(null);
    setOtpValue(new Array(6).fill(""));
    setError(null);
  };

  const quickAmounts = [1000, 2000, 5000, 10000];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md font-sans p-4 transition-all duration-300"
      onClick={onClose}
    >
      <main
        className="w-full max-w-4xl bg-white/95 rounded-3xl md:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden relative animate-[scaleIn_0.3s_ease-out] flex flex-col max-h-[90vh] border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 md:px-10 md:py-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            {step === "OTP" && (
              <button 
                onClick={handleBackToAmount}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
                  <Wallet size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Waste Wallet
                </h2>
              </div>
              <p className="text-sm text-gray-500 font-medium mt-2 flex items-center gap-2">
                <Clock size={14} className="text-emerald-500" />
                {step === "OTP" ? "Security Verification" : "Manage your earnings and instant withdrawals"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full p-3 transition-all duration-300 group"
          >
            <X
              size={24}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/30 custom-scrollbar scrollbar-customer"
          data-lenis-prevent
        >
          <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
            {step === "AMOUNT" && (
              <>
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <p className="text-emerald-100 text-sm font-bold uppercase tracking-[0.2em] mb-3">
                        Available Balance
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                          {balance.toLocaleString()}
                        </h3>
                        <span className="text-xl md:text-2xl font-bold text-emerald-200">
                          FCFA
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <p className="text-xs font-bold text-emerald-50 opacity-70 mb-1">
                        Lifetime Earnings
                      </p>
                      <p className="text-xl font-black">
                        {(balance + 7000).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="absolute left-1/4 top-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl"></div>
                </div>

                {/* Withdrawal Section */}
                <div className="glass-card rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 space-y-8 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10"></div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                      <ArrowDownCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight">
                        Withdraw Funds
                      </h4>
                      <p className="text-sm text-gray-400 font-medium">
                        Fast and secure transfers to your mobile wallet
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Operator Selector */}
                    <div className="flex p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
                      <button 
                        onClick={() => setOperator("MTN_Cameroon")}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black transition-all ${
                          operator === "MTN_Cameroon" 
                          ? "bg-[#FFCC00] text-black shadow-md scale-100" 
                          : "text-gray-400 hover:text-gray-600 scale-[0.98]"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${operator === "MTN_Cameroon" ? "bg-black" : "bg-transparent"}`}></div>
                        MTN MoMo
                      </button>
                      <button 
                        onClick={() => setOperator("Orange_Cameroon")}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black transition-all ${
                          operator === "Orange_Cameroon" 
                          ? "bg-[#FF6600] text-white shadow-md scale-100" 
                          : "text-gray-400 hover:text-gray-600 scale-[0.98]"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${operator === "Orange_Cameroon" ? "bg-white" : "bg-transparent"}`}></div>
                        Orange Money
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Amount Input */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">
                          Amount to Withdraw
                        </label>
                        <div className="relative group">
                          <input
                            type="number"
                            placeholder="0"
                            value={withdrawalAmount}
                            onChange={(e) => {
                              setWithdrawalAmount(e.target.value);
                              if (error) setError(null);
                            }}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-xl font-black focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                            FCFA
                          </div>
                        </div>
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">
                          Phone Number
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 border-r border-gray-200 pr-3 h-6 flex items-center">
                            +237
                          </div>
                          <input
                            type="tel"
                            placeholder="6xx xxx xxx"
                            value={phoneNumber}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              setPhoneNumber(
                                digits.startsWith("237")
                                  ? digits.slice(3, 12)
                                  : digits.slice(0, 9),
                              );
                              if (error) setError(null);
                            }}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-16 pr-4 py-4 text-xl font-black focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                        <AlertCircle size={18} />
                        <p className="text-sm font-bold">{error}</p>
                      </div>
                    )}

                    {/* Quick select */}
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            setWithdrawalAmount(amt.toString());
                            if (error) setError(null);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all active:scale-95"
                        >
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={isLoading || !withdrawalAmount || !phoneNumber}
                      onClick={handleInitiate}
                      className="w-full group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-emerald-200/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          <ArrowDownCircle size={24} />
                          Initiate Withdrawal
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                        <History size={24} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight">
                        Recent Activity
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-5 rounded-3xl bg-white border border-gray-50 hover:border-emerald-100 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform ${
                                tx.status === "SUCCESSFUL"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : tx.status === "PENDING"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {tx.status === "SUCCESSFUL" ? (
                                <TrendingUp size={20} />
                              ) : (
                                <TrendingDown size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {tx.status === "SUCCESSFUL" ? "Income" : "Withdrawal"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[80px]">
                                  {tx.transaction_id}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span className="text-xs text-gray-400 font-medium">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-lg ${
                              tx.status === "SUCCESSFUL"
                                ? "text-emerald-600"
                                : tx.status === "PENDING"
                                  ? "text-amber-600"
                                  : "text-red-500"
                            }`}>
                              {parseFloat(tx.amount).toLocaleString()} FCFA
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              {tx.status === "SUCCESSFUL" ? (
                                <CheckCircle2 size={12} className="text-emerald-500" />
                              ) : tx.status === "PENDING" ? (
                                <Clock size={12} className="text-orange-400" />
                              ) : null}
                              <span className={`text-[10px] font-black uppercase tracking-tight ${
                                tx.status === "SUCCESSFUL" ? "text-emerald-500" : tx.status === "PENDING" ? "text-orange-400" : "text-red-400"
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold">No activity yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === "OTP" && (
              /* OTP VERIFICATION STEP */
              <div className="max-w-md mx-auto py-10 space-y-8 animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner text-emerald-600">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Email Verification</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed px-4">
                    We've sent a 6-digit security code to your registered email address. Please enter it below to confirm your withdrawal of <span className="text-emerald-600 font-black">{parseFloat(withdrawalAmount).toLocaleString()} FCFA</span>.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* OTP Grid */}
                  <div className="flex justify-between gap-3">
                    {otpValue.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputs.current[idx] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-16 md:w-14 md:h-18 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-2xl font-black focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl animate-[shake_0.4s_ease-in-out]">
                      <AlertCircle size={18} />
                      <p className="text-sm font-bold">{error}</p>
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <button
                      disabled={isLoading || otpValue.some(v => !v)}
                      onClick={() => handleConfirm()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Verify & Withdraw"}
                    </button>

                    <button 
                      disabled={isLoading}
                      onClick={handleBackToAmount}
                      className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                    >
                      Restart withdrawal
                    </button>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                    <Mail size={20} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      If you don't see the email, please check your <span className="font-bold">Spam</span> folder. The code may expire; restart the withdrawal if it does.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SUCCESS / PROCESSING OVERLAYS */}
      {(step === "SUCCESS" || step === "PROCESSING") && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-[scaleIn_0.3s_ease-out] border border-gray-100 relative overflow-hidden">
            {/* Animated bg elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -z-10 ${step === "SUCCESS" ? "bg-emerald-500/10" : "bg-amber-500/10"}`}></div>
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative ${step === "SUCCESS" ? "bg-emerald-50" : "bg-amber-50"}`}>
              <div className={`absolute inset-0 rounded-full border-4 border-t-current animate-[spin_3s_linear_infinite] opacity-30 ${step === "SUCCESS" ? "border-emerald-100 text-emerald-500" : "border-amber-100 text-amber-500"}`}></div>
              {step === "SUCCESS" ? (
                <CheckCircle2 size={48} className="text-emerald-500 relative z-10 animate-[bounce_1s_infinite_ease-in-out]" />
              ) : (
                <Clock size={48} className="text-amber-500 relative z-10 animate-pulse" />
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
              {step === "SUCCESS" ? "Withdrawal Successful" : "Withdrawal Processing"}
            </h3>
            
            <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed px-2">
              {step === "SUCCESS" 
                ? `Your funds have been successfully transferred to your ${confirmationData?.operator.replace("_", " ")} account.`
                : "Your request has been received and is currently being processed by the network provider."
              }
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                <span className="font-black text-gray-900">{parseFloat(confirmationData?.amount || withdrawalAmount).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</span>
                <span className="text-xs font-bold text-gray-700 font-mono">{confirmationData?.reference_id || "PENDING"}</span>
              </div>
              {confirmationData?.new_balance && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Balance</span>
                  <span className="font-black text-emerald-600">{parseFloat(confirmationData.new_balance).toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
                step === "SUCCESS" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
              }`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletModal;
