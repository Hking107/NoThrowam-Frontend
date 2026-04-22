import React, { useState, useEffect } from "react";
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

interface PotentialBuyersModalProps {
  listing: any;
  onClose: () => void;
}

const BuyersModal: React.FC<PotentialBuyersModalProps> = ({ listing, onClose }) => {
  const [soldTo, setSoldTo] = useState<string | null>(null);

  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!listing || !listing.id) {
        setError("Invalid listing ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const proposalsData = await wasteService.getProposals(listing.id);
        setOffers(proposalsData);
      } catch (err: any) {
        setError(err.message || "A network error occurred while fetching proposals.");
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [listing]);

  const handleSell = async (_offerId: string | number, buyerName: string) => {
    setSoldTo(buyerName);
    // Simulate successful transaction
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const getBuyerName = (offer: any) => {
    if (offer.buyer_name) return offer.buyer_name;
    if (offer.buyer?.username) return offer.buyer.username;
    if (offer.buyer?.name) return offer.buyer.name;
    return "Unknown Buyer";
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
        {/* Header Section */}
        <div className="px-6 py-6 md:px-10 md:py-8 border-b border-gray-100 flex items-start justify-between bg-white/50 backdrop-blur-xl shrink-0 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-emerald-100">
                Active Listings Offers
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Tag size={24} className="text-emerald-600" />
              {listing.title || listing.category?.label || "Untitled Listing"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Package size={16} className="text-gray-400" />
                Quantity: <span className="text-gray-900 font-bold">{listing.quantity || listing.weight || 0} {listing.unit || "kg"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <TrendingUp size={16} className="text-gray-400" />
                Target Price: <span className="text-gray-900 font-bold">{(listing.price || listing.estimated_price || 0).toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full p-2.5 transition-all duration-300 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/30 custom-scrollbar scrollbar-customer"
          data-lenis-prevent
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-gray-900 tracking-tight uppercase text-xs opacity-40 tracking-widest">
                Potential Buyers List
              </h3>
              <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black border border-gray-100 shadow-sm">
                {offers.length} {offers.length === 1 ? 'OFFER' : 'OFFERS'}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Fetching best offers for you...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-3xl border border-red-100">
                <AlertCircle size={40} className="mb-4" />
                <p className="font-bold">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black uppercase underline tracking-widest">Try Again</button>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-gray-300">
                  <Building2 size={32} />
                </div>
                <p className="text-gray-400 font-medium max-w-[200px] mx-auto italic">No offers yet. We'll notify you as soon as a buyer is interested!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer, index) => {
                  const buyerName = getBuyerName(offer);
                  const offeredPrice = offer.proposed_price || offer.amount || offer.price || 0;
                  const isSoldToThis = soldTo === buyerName;

                  return (
                    <div
                      key={offer.id || index}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border transition-all duration-300 animate-[slideUp_0.4s_ease-out] relative overflow-hidden ${
                        isSoldToThis
                          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                          : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex gap-5 items-center relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isSoldToThis ? 'bg-emerald-600 text-white rotate-12 scale-110' : 'bg-blue-50 text-blue-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                        }`}>
                          <Building2 size={28} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg tracking-tight">
                            {buyerName}
                          </h4>
                          {offer.message ? (
                            <div className="flex items-center gap-2 mt-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 w-fit max-w-[250px]">
                                <MessageSquare size={12} className="text-gray-400" />
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                    {offer.message}
                                </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-[0.1em]">Verified Buyer</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-0 flex items-center justify-between sm:justify-end gap-8 shrink-0 relative z-10">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Proposed Offer</p>
                          <p className={`font-black text-2xl tracking-tighter ${isSoldToThis ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-600 transition-colors'}`}>
                            {offeredPrice.toLocaleString()} <span className="text-sm font-bold opacity-50">FCFA</span>
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleSell(offer.id, buyerName)}
                          disabled={soldTo !== null}
                          className={`group/btn flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest
                            ${
                              isSoldToThis
                                ? "bg-emerald-600 text-white shadow-emerald-200 cursor-default"
                                : soldTo !== null
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-black text-white shadow-emerald-100 hover:shadow-black/20"
                            }`}
                        >
                          {isSoldToThis ? (
                            <>
                              Sold! <CheckCircle2 size={18} className="animate-bounce" />
                            </>
                          ) : (
                            <>
                              Accept <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Decorative Background Icon */}
                      <Building2 className={`absolute -right-8 -bottom-8 opacity-[0.03] transition-all duration-700 ${isSoldToThis ? 'scale-125 opacity-[0.08] text-emerald-600' : 'group-hover:scale-110 group-hover:rotate-12'}`} size={160} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-10 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
            <Package size={12} /> Secure Transaction processing by NoThrowam
        </div>
      </main>
    </div>
  );
};

export default BuyersModal;