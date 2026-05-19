import React, { useState, useRef } from "react";
import {
  X,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
} from "lucide-react";
import type { MarketPoint } from "../../types/MarketPoint";
import { CATEGORY_EMOJI } from "../../hooks/constants/constants";
import { PurchaseBus } from "../../services/eventBus";
import { createProposal } from "../../services/ProposalAPI";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PaymentService } from "../../services/paymentService";


type PaymentPhase = "choose" | "phone_input" | "processing" | "pending" | "done" | "error";

type Operator = "Orange_Cameroon" | "MTN_Cameroon";

interface PaymentPanelProps {
  point: MarketPoint;
  onClose: () => void;
  onComplete: (method: string, txRef: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const OPERATORS: { id: Operator; label: string; color: string; bg: string; border: string }[] = [
  {
    id: "Orange_Cameroon",
    label: "Orange Money",
    color: "text-orange-600",
    bg: "bg-orange-600",
    border: "border-orange-100",
  },
  {
    id: "MTN_Cameroon",
    label: "MTN MoMo",
    color: "text-yellow-600",
    bg: "bg-yellow-500",
    border: "border-yellow-100",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const PaymentPanel: React.FC<PaymentPanelProps> = ({ point, onClose, onComplete }) => {
  const [phase, setPhase] = useState<PaymentPhase>("choose");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [txRef, setTxRef] = useState("");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      containerRef.current,
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
    );
  }, []);

  const handleClose = () => {
    gsap.to(containerRef.current, { scale: 0.9, opacity: 0, y: 10, duration: 0.3, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  // Step 1 – Choose operator
  const handleChooseOperator = async (op: Operator) => {
    setSelectedOperator(op);

    // If post is RESERVED → the seller already accepted → go straight to phone input
    if (point.status === "RESERVED") {
      setPhase("phone_input");
      return;
    }

    // Otherwise we need to create/check the proposal first
    setPhase("phone_input");
  };

  // Step 2 – Submit phone number and call the real payment API
  const handleSubmitPayment = async () => {
    if (!selectedOperator) return;
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 9) {
      setErrMsg("Numéro de téléphone invalide. Exemple : 670 123 456");
      setPhase("error");
      return;
    }

    setPhase("processing");
    try {
      const data = await PaymentService.initiatePayment(point.id, phoneNumber, selectedOperator);
      const payment = data.payment;
      const pid = payment?.id ?? null;
      const paymentStatus: string = (payment?.status ?? "PENDING").toUpperCase();

      setPaymentId(pid);
      const ref = payment?.transaction_id ?? `PAY-${pid}`;
      setTxRef(ref);

      if (paymentStatus === "FAILED") {
        // Previous attempt failed — tell the user clearly and let them retry
        setErrMsg(
          "Votre précédent paiement pour ce lot n'a pas abouti (la demande Mobile Money n'a pas été confirmée). " +
          "Veuillez réessayer avec le bon numéro et confirmer la demande sur votre téléphone."
        );
        setPhase("error");
        return;
      }

      if (paymentStatus === "SUCCESSFUL") {
        // Already paid — edge case, just show success
        setPhase("done");
        PurchaseBus.setState({ phase: "done", txRef: ref });
        onComplete(selectedOperator, ref);
        return;
      }

      // PENDING or any other status → awaiting mobile confirmation
      setPhase("pending");
      PurchaseBus.setState({ phase: "done", txRef: ref });
      onComplete(selectedOperator, ref);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Erreur lors de l'initiation du paiement.");
      setPhase("error");
    }
  };

  const emoji = CATEGORY_EMOJI[point.category] || "📦";

  return (
    <div className="fixed inset-0 z-4000 flex items-center justify-center p-4 font-sans">
      <div
        ref={overlayRef}
        onClick={phase === "choose" || phase === "phone_input" ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-6 bg-gradient-to-br from-emerald-50 via-emerald-50/30 to-white border-b border-emerald-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-emerald-900 tracking-tight">
              {phase === "phone_input" ? "Numéro de téléphone" : "Finaliser le paiement"}
            </h2>
            {(phase === "choose" || phase === "phone_input") && (
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-lg transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shadow-inner">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                  {point.label}
                </p>
                <p className="text-[11px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-wider">
                  {point.category}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Poids Total</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{point.fixedWeight}</span>
                  <span className="text-xs font-bold text-slate-400">{point.weightUnit}</span>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Montant</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700">{point.fixedPrice?.toLocaleString()}</span>
                  <span className="text-xs font-black text-emerald-600/50">{point.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">

          {/* Phase: choose operator */}
          {phase === "choose" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight mb-1">Mode de règlement</p>
                <p className="text-xs font-medium text-slate-400">Sélectionnez votre opérateur Mobile Money.</p>
              </div>
              <div className="space-y-3">
                {OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => handleChooseOperator(op.id)}
                    className={`w-full group flex items-center gap-4 p-4 rounded-3xl border-2 ${op.border} bg-${op.id === "Orange_Cameroon" ? "orange" : "yellow"}-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${op.bg} flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6`}>
                      <Smartphone size={22} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-black tracking-tight ${op.color}`}>{op.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sécurisé & Instantané</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black ${op.color}`}>{point.fixedPrice?.toLocaleString()}</span>
                      <span className="text-[10px] font-black opacity-40 ml-1 uppercase">{point.currency}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phase: phone number input */}
          {phase === "phone_input" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight mb-1">
                  Numéro {selectedOperator === "Orange_Cameroon" ? "Orange Money" : "MTN MoMo"}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Entrez le numéro qui recevra la demande de paiement.
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6XX XXX XXX"
                  maxLength={12}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold text-base tracking-widest focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Format accepté : <span className="font-bold">6XX XXX XXX</span> ou <span className="font-bold">237 6XX XXX XXX</span>
              </p>

              <button
                onClick={handleSubmitPayment}
                disabled={phoneNumber.replace(/\D/g, "").length < 9}
                className="w-full h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                Confirmer et payer
              </button>
            </div>
          )}

          {/* Phase: processing */}
          {phase === "processing" && (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-50" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="text-emerald-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-black text-emerald-900 tracking-tight">Traitement en cours</h3>
              <p className="text-sm font-medium text-slate-400 mt-2">Veuillez ne pas quitter cette page...</p>
            </div>
          )}

          {/* Phase: pending (payment initiated, waiting for mobile confirmation) */}
          {phase === "pending" && (
            <div className="py-8 text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30">
                <Smartphone size={48} className="text-white" />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Confirmez sur votre téléphone !
              </h3>
              <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-4">
                Une demande de paiement a été envoyée au <span className="font-black text-slate-700">{phoneNumber}</span>.
                Validez-la sur votre téléphone pour finaliser l'achat.
              </p>

              {txRef && (
                <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-black text-amber-800/40 uppercase tracking-widest">
                    Réf. paiement :
                  </span>
                  <span className="text-xs font-black text-amber-700 tracking-wider">{txRef}</span>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-400">
                Le vendeur sera notifié dès la confirmation du paiement.
              </p>

              <button
                onClick={handleClose}
                className="mt-10 w-full py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl text-sm font-black text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
              >
                C'est compris
              </button>
            </div>
          )}

          {/* Phase: done (proposal sent, not yet accepted) */}
          {phase === "done" && (
            <div className="py-8 text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 scale-110">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-emerald-900 tracking-tight">Offre envoyée !</h3>
              <p className="mt-6 text-sm font-medium text-slate-500 leading-relaxed px-4">
                Votre proposition a été transmise au vendeur. Vous serez notifié dès qu'il l'aura acceptée.
              </p>
              <button
                onClick={handleClose}
                className="mt-10 w-full py-4 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-3xl text-sm font-black text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
              >
                C'est compris
              </button>
            </div>
          )}

          {/* Phase: error */}
          {phase === "error" && (
            <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                {errMsg.includes("refusée") || errMsg.includes("expiré") ? "Action impossible" : "Échec du paiement"}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-400 px-6">
                {errMsg}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPhase("choose")}
                  className="py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Abandonner
                </button>
                <button
                  onClick={handleClose}
                  className="py-4 bg-red-500 rounded-3xl text-sm font-black text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Reesayer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
