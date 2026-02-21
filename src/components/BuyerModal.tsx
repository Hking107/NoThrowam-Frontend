import React, { useState } from 'react';
import { X, Star, MapPin, CheckCircle, Package, Building2 } from 'lucide-react';

interface Buyer {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceOffered: string;
  verified: boolean;
}

interface PotentialBuyersModalProps {
  listing: any; // On récupère les infos de l'annonce cliquée
  onClose: () => void;
}

// --- DONNÉES FICTIVES DES ACHETEURS ---
const mockBuyers: Buyer[] = [
  { id: 'B-01', name: 'EcoPlast Industries', rating: 4.8, distance: '12 km', priceOffered: '125.00 FCFA', verified: true },
  { id: 'B-02', name: 'RecycleTech SARL', rating: 4.5, distance: '5 km', priceOffered: '120.00 FCFA', verified: true },
  { id: 'B-03', name: 'Green Solutions', rating: 4.9, distance: '25 km', priceOffered: '126.50 FCFA', verified: false },
];

const BuyersModal: React.FC<PotentialBuyersModalProps> = ({ listing, onClose }) => {
  const [soldTo, setSoldTo] = useState<string | null>(null);

  const handleSell = (buyerName: string) => {
   
    setSoldTo(buyerName);
    setTimeout(() => {
      alert(`Félicitations ! Vous avez vendu "${listing.title}" à ${buyerName}.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md font-sans p-4 animate-[fadeIn_0.2s_ease-out]">
      
      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">{listing.id}</span> */}
              <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-green-200">
                Acheteurs trouvés
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {listing.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quantité : <span className="font-bold text-gray-700">{listing.weight}</span> • 
              Votre prix : <span className="font-bold text-gray-700">{listing.price}</span>
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-100 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* LISTE DES ACHETEURS */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <h3 className="font-bold text-gray-800 mb-6">Acheteurs potentiels ({mockBuyers.length})</h3>
          
          <div className="space-y-4">
            {mockBuyers.map((buyer) => (
              <div key={buyer.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${soldTo === buyer.name ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 hover:shadow-md'}`}>
                
                {/* Infos Acheteur */}
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      {buyer.name}
                      {/* {buyer.verified && <CheckCircle size={14} className="text-blue-500" title="Acheteur vérifié" />} */}
                    </h4>
                    {/* <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1 text-yellow-500"><Star size={12} fill="currentColor"/> {buyer.rating}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {buyer.distance}</span>
                    </div> */}
                  </div>
                </div>

                {/* Offre & Bouton d'action */}
                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Offre</p>
                    <p className="font-bold text-lg text-gray-900">{buyer.priceOffered}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleSell(buyer.name)}
                    disabled={soldTo !== null}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm
                      ${soldTo === buyer.name 
                        ? 'bg-green-500 text-white cursor-default' 
                        : soldTo !== null 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5 hover:shadow-green-500/30'
                      }`}
                  >
                    {soldTo === buyer.name ? (
                      <>Vendu ! <CheckCircle size={18} /></>
                    ) : (
                      'Sell'
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default BuyersModal;