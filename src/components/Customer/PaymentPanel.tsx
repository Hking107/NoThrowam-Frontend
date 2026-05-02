import React, { useState, useRef } from "react";
import {
  X,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { MarketPoint } from "../../types/MarketPoint";
import { CATEGORY_EMOJI } from "../../hooks/constants/constants";
import { PurchaseBus } from "../../services/eventBus";
import { createProposal } from "../../services/ProposalAPI";
import { useWebSocket } from "../../WebSocketProvider";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type PaymentPhase = "choose" | "processing" | "done" | "error";

interface PaymentPanelProps {
  point: MarketPoint;
  onClose: () => void;
  onComplete: (method: string, txRef: string) => void;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({
  point,
  onClose,
  onComplete,
}) => {
  const [phase, setPhase] = useState<PaymentPhase>("choose");
  const [method, setMethod] = useState<string | null>(null);
  const [txRef, setTxRef] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const { proposalWs } = useWebSocket();

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
    );
    gsap.fromTo(
      containerRef.current,
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
    );
  }, []);

  const handlePay = async (m: string) => {
    setMethod(m);
    setPhase("processing");
    try {
      const { alreadyExists } = await createProposal(point.id);

      if (!alreadyExists) {
        // Broadcast via global WebSocket
        if (proposalWs) {
          proposalWs.sendEvent('proposal.create', { post_id: point.id });
        }
      }

      const ref = alreadyExists
        ? "PROP-EXIST"
        : "PROP-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      setTxRef(ref);
      setPhase("done");
      PurchaseBus.setState({ phase: "done", txRef: ref });
      onComplete(m, ref);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Erreur inconnue");
      setPhase("error");
    }
  };

  const handleClose = () => {
    gsap.to(containerRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  const methods = [
    {
      id: "orange",
      label: "Orange Money",
      icon: Smartphone,
      color: "bg-orange-600",
      border: "border-orange-100",
      highlight: "bg-orange-50",
    },
  ];

  const emoji = CATEGORY_EMOJI[point.category] || "📦";

  return (
    <div className="fixed inset-0 z-4000 flex items-center justify-center p-4 font-sans">
      <div
        ref={overlayRef}
        onClick={phase === "choose" ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-8 pb-6 bg-linear-to-br from-emerald-50 via-emerald-50/30 to-white border-b border-emerald-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-emerald-900 tracking-tight">
              Finaliser l'achat
            </h2>
            {phase === "choose" && (
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
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Poids Total
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">
                    {point.fixedWeight}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {point.weightUnit}
                  </span>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">
                  Montant
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700">
                    {point.fixedPrice?.toLocaleString()}
                  </span>
                  <span className="text-xs font-black text-emerald-600/50">
                    {point.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {phase === "choose" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight mb-1">
                  Mode de règlement
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Sélectionnez votre moyen de paiement préféré.
                </p>
              </div>

              <div className="space-y-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handlePay(m.id)}
                    className={`w-full group flex items-center gap-4 p-4 rounded-3xl border-2 ${m.border} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${m.highlight}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6`}
                    >
                      <m.icon size={22} />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`text-sm font-black tracking-tight ${m.color.replace("bg-", "text-")}`}
                      >
                        {m.label}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sécurisé & Instantané
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-base font-black ${m.color.replace("bg-", "text-")}`}
                      >
                        {point.fixedPrice}
                      </span>
                      <span className="text-[10px] font-black opacity-40 ml-1 uppercase">
                        {point.currency}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "processing" && (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-50" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    size={32}
                    className="text-emerald-500 animate-pulse"
                  />
                </div>
              </div>
              <h3 className="text-lg font-black text-emerald-900 tracking-tight">
                Traitement en cours
              </h3>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Veuillez ne pas quitter cette page...
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="py-8 text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 scale-110">
                <CheckCircle size={48} className="text-white" />
              </div>

              <h3 className="text-xl font-black text-emerald-900 tracking-tight">
                {txRef === "PROP-EXIST" ? "Déjà en cours" : "Offre envoyée !"}
              </h3>

              <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest leading-none">
                  Référence :
                </span>
                <span className="text-xs font-black text-emerald-700 tracking-wider leading-none">
                  {txRef}
                </span>
              </div>

              <p className="mt-8 text-sm font-medium text-slate-500 leading-relaxed px-4">
                {txRef === "PROP-EXIST"
                  ? "Une demande pour ce lot est déjà en attente. Vous serez notifié dès qu'elle sera acceptée."
                  : "Votre proposition a été transmise au vendeur ! Nous vous enverrons une notification dès que le vendeur aura accepté votre proposition."}
              </p>

              <button
                onClick={handleClose}
                className="mt-10 w-full py-4 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-3xl text-sm font-black text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
              >
                C'est compris
              </button>
            </div>
          )}

          {phase === "error" && (
            <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                Échec du paiement
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-400 px-6">
                {errMsg}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPhase("choose")}
                  className="py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Réessayer
                </button>
                <button
                  onClick={handleClose}
                  className="py-4 bg-red-500 rounded-3xl text-sm font-black text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Abandonner
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
