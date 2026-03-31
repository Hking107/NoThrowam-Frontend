import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Building2, Loader2, AlertCircle } from 'lucide-react';

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
      // Sécurité : si on n'a pas d'ID, on ne lance pas la requête.
      if (!listing || !listing.id) {
        setError("Invalid listing ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        
        // NOUVEL ENDPOINT avec ${listing.id}
        const response = await fetch(`/api/v0/waste-posts/${listing.id}/proposals/`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOffers(data.proposals || []);
        } else {
          setError(`Failed to load offers. Server responded with status: ${response.status}`);
          console.error("Server Error:", response.status);
        }
      } catch (err) {
        setError("A network error occurred while fetching proposals.");
        console.error("Network Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [listing]);

  const handleSell = async (offerId: string | number, buyerName: string) => {
    setSoldTo(buyerName);
    setTimeout(() => {
      alert(`Congratulations! You have sold "${listing.title || 'this item'}" to ${buyerName}.`);
      onClose();
    }, 1500);
  };

  const getBuyerName = (offer: any) => {
    if (offer.buyer_name) return offer.buyer_name;
    if (offer.buyer?.username) return offer.buyer.username;
    if (offer.buyer?.name) return offer.buyer.name;
    return "Unknown Buyer";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md font-sans p-4 animate-[fadeIn_0.2s_ease-out]">
      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-green-200">
                Offers Found
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {listing.title || listing.category?.label || 'Untitled Listing'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quantity: <span className="font-bold text-gray-700">{listing.quantity || listing.weight || 0} {listing.unit || 'kg'}</span> • 
              Your Price: <span className="font-bold text-gray-700">{listing.price || listing.estimated_price || 0} FCFA</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-100 hover:bg-gray-100 rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            Potential Buyers <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{offers.length}</span>
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-500 mb-4" size={32} />
              <p className="text-gray-500">Loading offers...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <AlertCircle size={32} className="mb-4" />
              <p>{error}</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>No offers have been made for this listing yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const buyerName = getBuyerName(offer);
                // J'ai ajouté 'amount' ici au cas où l'API renvoie ce terme
                const offeredPrice = offer.proposed_price || offer.amount || offer.price || 0;
                const isSoldToThis = soldTo === buyerName;

                return (
                  <div key={offer.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${isSoldToThis ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 hover:shadow-md'}`}>
                    <div className="flex gap-4 items-center">
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
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Offer</p>
                        <p className="font-bold text-lg text-gray-900">{offeredPrice} FCFA</p>
                      </div>
                      <button 
                        onClick={() => handleSell(offer.id, buyerName)}
                        disabled={soldTo !== null}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm
                          ${isSoldToThis ? 'bg-green-500 text-white cursor-default' : soldTo !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5 hover:shadow-green-500/30'}`}
                      >
                        {isSoldToThis ? (<>Sold! <CheckCircle size={18} /></>) : ('Accept')}
                      </button>
                    </div>
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