import { Wallet, X, Smartphone, ArrowDownCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletModalProps {
  onClose: () => void;
  balance?: number; 
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, balance = 0 }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans p-4"
      onClick={onClose}
    >
      <main 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="text-green-600" />
              Waste Wallet
            </h2>
            <p className="text-sm text-gray-500 mt-1">Gérez vos gains et vos retraits</p>
          </div>
          
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-2xl mx-auto space-y-8">
            
            <div className="bg-linear-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Solde disponible</p>
                <h3 className="text-4xl font-black mt-2">{balance.toLocaleString()} FCFA</h3>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* --- SECTION RETRAIT --- */}
            <div className="space-y-4">
              <h4 className="text-gray-700 font-semibold flex items-center gap-2">
                <ArrowDownCircle size={20} className="text-gray-400" />
                Effectuer un retrait via :
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bouton MTN */}
                <button className="flex items-center justify-center gap-3 bg-[#FFCC00] hover:bg-[#e6b800] text-black font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95">
                  <div className="bg-black text-white p-1 rounded-md">
                    <Smartphone size={20} />
                  </div>
                  Retrait MTN MoMo
                </button>

                {/* Bouton Orange */}
                <button className="flex items-center justify-center gap-3 bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95">
                  <div className="bg-white text-[#FF6600] p-1 rounded-md">
                    <Smartphone size={20} />
                  </div>
                  Retrait Orange Money
                </button>
              </div>
            </div>

                {/* --- HISTORIQUE DES TRANSACTIONS --- */}
            <div className="grid grid-cols-1 gap-6">

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default WalletModal;