import {
  X,
  CheckCircle2,
  Building2,
  Loader2,
  AlertCircle,
  Tag,
  Package,
  ChevronRight,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { wasteService } from "../services/wasteService";
import React, { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "../WebSocketProvider";

const CustToast = ({ msg }: { msg: string }) => (
  <div
    className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] px-5 py-3
                  bg-white/95 backdrop-blur-xl border border-green-500/20 rounded-2xl
                  shadow-2xl shadow-green-500/20 text-green-700 font-bold text-sm
                  flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
  >
    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    {msg}
  </div>
);
interface PotentialBuyersModalProps {
  listing: any;
  onClose: () => void;
}

const BuyersModal: React.FC<PotentialBuyersModalProps> = ({
  listing,
  onClose,
}) => {
  const [soldTo, setSoldTo] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { proposalsWs, proposalWs } = useWebSocket();


  const fetchOffers = useCallback(async () => {
    if (!listing || !listing.id) return;
    try {
      const proposalsData = await wasteService.getProposals(listing.id);
      setOffers(proposalsData || []);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des offres:", err);
    }
  }, [listing]);

  // Écoute des nouvelles propositions en temps réel
  useEffect(() => {
    if (!proposalWs) return;

    const handleNewProposal = (data: any) => {
      const incoming = data.proposal || data;
      // Si la proposition concerne ce lot exact, on rafraîchit
      if (
        incoming.post_id === listing.id ||
        incoming.post === listing.id ||
        data.post_id === listing.id
      ) {
        fetchOffers();
      }
    };

    proposalWs.on("proposal.created", handleNewProposal);
    proposalWs.on("proposal_created", handleNewProposal);

    return () => {
      proposalWs.off("proposal.created", handleNewProposal);
      proposalWs.off("proposal_created", handleNewProposal);
    };
  }, [proposalWs, listing.id, fetchOffers]);

  // Chargement initial
  useEffect(() => {
    const initFetch = async () => {
      if (!listing || !listing.id) {
        setError("ID de lot invalide.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const proposalsData = await wasteService.getProposals(listing.id);
        setOffers(proposalsData || []);
      } catch (err: any) {
        setError(err.message || "Erreur réseau lors de la récupération.");
      } finally {
        setIsLoading(false);
      }
    };

    initFetch();
  }, [listing]);

  const handleSell = async (_offerId: string | number, buyerName: string) => {
    if (!_offerId) {
      setError("Impossible d'accepter : ID de l'offre introuvable.");
      return;
    }

    try {
      // 1. Mise à jour Backend (API REST)
      await wasteService.acceptProposal(_offerId);

      // 2. Notification temps réel (WebSocket)
      if (proposalsWs) {
        const status = "ACCEPTED";
        proposalsWs.sendEvent("proposal.accept", {
          proposal_id: _offerId,
          status: status,
        });
      }

      // 3. Mise à jour UI
      setSoldTo(buyerName);
      setToastMsg(
        `Félicitations ! Vous avez accepté la proposition de ${buyerName}.`,
      );
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Échec de l'acceptation de la proposition.");
    }
  };

  const getBuyerName = (offer: any) => {
    return (
      offer.buyer_name ||
      offer.buyer?.username ||
      offer.buyer?.name ||
      "Acheteur inconnu"
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md font-sans p-4 transition-all duration-300"
      onClick={onClose}
    >
      <main
        className="w-full max-w-3xl bg-white/95 rounded-3xl md:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden relative animate-[scaleIn_0.3s_ease-out] flex flex-col max-h-[90vh] border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {toastMsg && <CustToast msg={toastMsg} />}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-green-200">
                Offres Trouvées
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {listing.title || listing.category?.label || "Titre Inconnu"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quantité :{" "}
              <span className="font-bold text-gray-700">
                {listing.quantity || listing.weight || 0} {listing.unit || "kg"}
              </span>{" "}
              • Votre Prix :{" "}
              <span className="font-bold text-gray-700">
                {listing.price || listing.estimated_price || 0} FCFA
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full p-2.5 transition-all duration-300 group"
          >
            <X
              size={24}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white" data-lenis-prevent>
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            Acheteurs Potentiels{" "}
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {offers.length}
            </span>
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-500 mb-4" size={32} />
              <p className="text-gray-500">Chargement des offres...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>Aucune offre n'a encore été faite pour ce lot.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer, idx) => {
                const buyerName = getBuyerName(offer);
                const offeredPrice =
                  offer.proposed_price || offer.amount || offer.price || 0;
                const isSoldToThis = soldTo === buyerName;

                // Gérer les cas où le backend renvoie l'ID sous un autre nom
                const offerId =
                  offer.id || offer.proposal_id || offer.uuid || offer.pk;

                return (
                  <div
                    key={offerId || idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all relative overflow-hidden group ${isSoldToThis ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-emerald-200 hover:shadow-md"}`}
                  >
                    <div className="flex gap-4 items-center relative z-10">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {buyerName}
                        </h4>
                        {offer.message && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">
                            "{offer.message}"
                          </p>
                        )}
                        {!offerId && (
                          <p className="text-[10px] text-red-400 font-bold mt-1">
                            ⚠️ ID Introuvable
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-0 flex items-center justify-between sm:justify-end gap-8 shrink-0 relative z-10">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">
                          Proposed Offer
                        </p>
                        <p
                          className={`font-black text-2xl tracking-tighter ${isSoldToThis ? "text-emerald-700" : "text-gray-900 group-hover:text-emerald-600 transition-colors"}`}
                        >
                          {offeredPrice.toLocaleString()}{" "}
                          <span className="text-sm font-bold opacity-50">
                            FCFA
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleSell(offerId, buyerName)}
                        disabled={soldTo !== null || !offerId}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm
                          ${isSoldToThis ? "bg-green-500 text-white cursor-default" : soldTo !== null || !offerId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5 hover:shadow-green-500/30"}`}
                      >
                        {isSoldToThis ? (
                          <>
                            Vendu ! <CheckCircle2 size={18} />
                          </>
                        ) : (
                          "Accepter"
                        )}
                      </button>
                    </div>

                    {/* Decorative Background Icon */}
                    <Building2
                      className={`absolute -right-8 -bottom-8 transition-all duration-700 pointer-events-none z-0 ${isSoldToThis ? "scale-125 opacity-[0.08] text-emerald-600" : "opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-[0.05]"}`}
                      size={160}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BuyersModal;
