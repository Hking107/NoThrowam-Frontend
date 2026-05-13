import React, { useState } from "react";
import { useEffect } from "react";
import {
  Wallet,
  X,
  Smartphone,
  ArrowDownCircle,
  History,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface WalletModalProps {
  onClose: () => void;
  balance?: number;
}

interface Transaction {
  id: string;
  type: "income" | "withdrawal";
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, balance = 0 }) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    amount: number;
    method: string;
  } | null>(null);

  // Dummy Transaction Data
  const transactions: Transaction[] = [
    {
      id: "TRX-001",
      type: "income",
      amount: 15000,
      date: "2024-04-20",
      description: "Waste Sale: #1042 - Plastic",
      status: "completed",
    },
    {
      id: "TRX-002",
      type: "withdrawal",
      amount: 5000,
      date: "2024-04-18",
      description: "Mobile Money Withdrawal (MTN)",
      status: "completed",
    },
    {
      id: "TRX-003",
      type: "income",
      amount: 8500,
      date: "2024-04-15",
      description: "Waste Sale: #1038 - Metal",
      status: "completed",
    },
    {
      id: "TRX-004",
      type: "withdrawal",
      amount: 2000,
      date: "2024-04-12",
      description: "Mobile Money Withdrawal (Orange)",
      status: "pending",
    },
  ];

  const handleWithdraw = (method: string) => {
    setError(null);
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amount > balance) {
      setError("Insufficient balance.");
      return;
    }

    setIsWithdrawing(true);
    // Simulate API call
    setTimeout(() => {
      setIsWithdrawing(false);
      setSuccessData({ amount, method });
      setWithdrawalAmount("");
    }, 1500);
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
              Manage your earnings and instant withdrawals
            </p>
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

              {/* Decorative elements */}
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
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                    Amount to Withdraw
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      placeholder="Enter amount..."
                      value={withdrawalAmount}
                      onChange={(e) => {
                        setWithdrawalAmount(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 md:px-6 md:py-5 text-xl md:text-2xl font-black focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                      FCFA
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm font-bold mt-2 animate-[fadeIn_0.2s_ease-out]">
                      {error}
                    </p>
                  )}

                  {/* Quick select */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setWithdrawalAmount(amt.toString());
                          if (error) setError(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all active:scale-95"
                      >
                        +{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    disabled={isWithdrawing}
                    onClick={() => handleWithdraw("MTN MoMo")}
                    className="group flex items-center justify-between gap-4 bg-[#FFCC00] hover:bg-[#F2C200] text-black font-black py-4 px-6 md:py-5 md:px-8 rounded-[1.5rem] transition-all shadow-lg shadow-yellow-200/50 active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-black text-white p-2 rounded-xl">
                        <Smartphone size={20} />
                      </div>
                      <span className="text-sm md:text-base">MTN MoMo</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>

                  <button
                    disabled={isWithdrawing}
                    onClick={() => handleWithdraw("Orange Money")}
                    className="group flex items-center justify-between gap-4 bg-[#FF6600] hover:bg-[#E65C00] text-white font-black py-4 px-6 md:py-5 md:px-8 rounded-[1.5rem] transition-all shadow-lg shadow-orange-200/50 active:scale-[0.98] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white text-[#FF6600] p-2 rounded-xl">
                        <Smartphone size={20} />
                      </div>
                      <span className="text-sm md:text-base">Orange Money</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                    <History size={24} />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">
                    Recent Activity
                  </h4>
                </div>
                <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-5 rounded-3xl bg-white border border-gray-50 hover:border-emerald-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform ${
                          tx.type === "income"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {tx.id}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(tx.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black text-lg ${
                          tx.type === "income"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {tx.amount.toLocaleString()} FCFA
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {tx.status === "completed" ? (
                          <CheckCircle2
                            size={12}
                            className="text-emerald-500"
                          />
                        ) : tx.status === "pending" ? (
                          <Clock size={12} className="text-orange-400" />
                        ) : null}
                        <span
                          className={`text-[10px] font-black uppercase tracking-tight ${
                            tx.status === "completed"
                              ? "text-emerald-500"
                              : tx.status === "pending"
                                ? "text-orange-400"
                                : "text-red-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      {successData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-[scaleIn_0.3s_ease-out] border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -z-10"></div>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-[spin_3s_linear_infinite] opacity-50"></div>
              <CheckCircle2
                size={40}
                className="text-emerald-500 relative z-10"
              />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Withdrawal Initiated
            </h3>
            <p className="text-gray-500 font-medium mb-8 text-sm">
              Your withdrawal of{" "}
              <span className="font-bold text-gray-900">
                {successData.amount.toLocaleString()} FCFA
              </span>{" "}
              via{" "}
              <span className="font-bold text-gray-900">
                {successData.method}
              </span>{" "}
              is currently processing.
            </p>
            <button
              onClick={() => setSuccessData(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletModal;
