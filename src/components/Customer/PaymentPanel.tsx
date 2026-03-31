import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

import type { MarketPoint } from '../../types/MarketPoint';
import { CATEGORY_EMOJI } from '../../constants/constants';
import { PurchaseBus } from '../../Customer_Section/Customeragentchat';
import { createProposal } from '../../services/ProposalAPI';

type PaymentPhase = "choose" | "processing" | "done" | "error";

interface PaymentPanelProps {
  point: MarketPoint;
  onClose: () => void;
  onComplete: (method: string, txRef: string) => void;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ point, onClose, onComplete }) => {
  const [phase, setPhase]     = useState<PaymentPhase>("choose");
  const [method, setMethod]   = useState<string | null>(null);
  const [txRef, setTxRef]     = useState("");
  const [errMsg, setErrMsg]   = useState("");
  const [visible, setVisible] = useState(false);

  const emoji =  CATEGORY_EMOJI[point.category] ||  "📦";

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handlePay = async (m: string) => {
    setMethod(m);
    setPhase("processing");
    try {
      const { alreadyExists } = await createProposal(point.id);
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

  const methods = [
    { id: "card",   label: "Carte Bancaire", icon: CreditCard, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { id: "momo",   label: "MTN MoMo",       icon: Smartphone, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { id: "orange", label: "Orange Money",   icon: Smartphone, color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 4000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)",
      }}
      onClick={phase === "choose" ? onClose : undefined}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 390, background: "white", borderRadius: 24, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,.25)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          transform: visible ? "scale(1)" : "scale(0.88)",
          opacity:   visible ? 1 : 0,
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
          padding: "20px 22px 16px",
          borderBottom: "1px solid rgba(34,197,94,.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#15803d" }}>Proposer un achat</span>
            {phase === "choose" && (
              <button onClick={onClose} style={{
                width: 28, height: 28, borderRadius: 8, border: "none",
                background: "rgba(0,0,0,.06)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
              }}><X size={13} /></button>
            )}
          </div>

          {/* Lot summary */}
          <div style={{
            background: "white", borderRadius: 14, padding: "14px 16px",
            border: "1px solid rgba(34,197,94,.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{emoji}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{point.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{point.description}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 12px", borderRadius: 11,
                background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: ".05em" }}>QUANTITÉ</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#374151" }}>
                  {point.fixedWeight}
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}> {point.weightUnit}</span>
                </p>
              </div>
              <div style={{
                flex: 1, padding: "10px 12px", borderRadius: 11,
                background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: ".05em" }}>PRIX</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#15803d" }}>
                  {point.fixedPrice?.toLocaleString()}
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#4ade80" }}> {point.currency}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {phase === "choose" && (
            <>
              <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Choisir le mode de paiement
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 11, color: "#94a3b8" }}>
                Une proposition PENDING sera créée et le vendeur sera notifié.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {methods.map(m => (
                  <button key={m.id} onClick={() => handlePay(m.id)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 14,
                    border: `1.5px solid ${m.border}`,
                    background: m.bg, cursor: "pointer",
                    transition: "transform .15s",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    textAlign: "left",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, background: m.color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <m.icon size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: m.color }}>{m.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Paiement instantané et sécurisé</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: m.color }}>
                        {point.fixedPrice?.toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{point.currency}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "processing" && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "3px solid rgba(34,197,94,.15)",
                borderTop: "3px solid #22c55e",
                animation: "custSpin 1s linear infinite",
                margin: "0 auto 18px",
              }} />
              <p style={{ margin: 0, fontWeight: 700, color: "#15803d", fontSize: 15 }}>Création de la proposition…</p>
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                {methods.find(m => m.id === method)?.label}
              </p>
              <style>{`@keyframes custSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 28px rgba(34,197,94,.38)",
              }}>
                <CheckCircle size={32} color="white" />
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#15803d", fontSize: 17 }}>
                {txRef === "PROP-EXIST" ? "Proposition déjà existante" : "Proposition envoyée !"}
              </p>
              <div style={{
                display: "inline-block", padding: "6px 16px", borderRadius: 8,
                background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 14,
              }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Réf : </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#15803d", letterSpacing: ".05em" }}>
                  {txRef}
                </span>
              </div>
              <p style={{ margin: "0 0 22px", fontSize: 12, color: "#64748b", lineHeight: 1.65 }}>
                {txRef === "PROP-EXIST"
                  ? "Vous avez déjà une proposition en cours pour ce lot."
                  : "Le vendeur a été notifié. Votre proposition est en attente de confirmation."
                }
              </p>
              <button onClick={onClose} style={{
                padding: "12px 32px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(34,197,94,.38)",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}>Terminer</button>
            </div>
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 28px rgba(239,68,68,.38)",
              }}>
                <X size={32} color="white" />
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#dc2626", fontSize: 17 }}>
                Erreur
              </p>
              <p style={{ margin: "0 0 22px", fontSize: 12, color: "#64748b" }}>{errMsg}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => setPhase("choose")} style={{
                  padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                  background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>Réessayer</button>
                <button onClick={onClose} style={{
                  padding: "10px 20px", borderRadius: 12, border: "none",
                  background: "#ef4444", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;