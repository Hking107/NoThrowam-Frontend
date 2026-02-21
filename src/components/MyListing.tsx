import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Package, Eye, X, Users } from 'lucide-react';
import BuyersModal from './BuyerModal'; 

interface MyListingsModalProps {
  onClose: () => void;
}

const mockListings = [
  { id: 'LST-8832', title: 'Bouteilles en plastique PET (Tariées)', weight: '45.5 kg', price: '124.00 FCFA', status: 'Active', date: '24 Oct 2023', views: 12 },
  { id: 'LST-2201', title: 'Déchets d\'Aluminium', weight: '120.0 kg', price: '360.50 FCFA', status: 'Pending', date: '22 Oct 2023', views: 5 },
  { id: 'LST-5541', title: 'Carton compressé (Balles)', weight: '200.0 kg', price: '85.20 FCFA', status: 'Active', date: '20 Oct 2023', views: 34 },
  { id: 'LST-9012', title: 'Verre mélangé brisé', weight: '85.0 kg', price: '40.00 FCFA', status: 'Sold', date: '15 Oct 2023', views: 45 },
  { id: 'LST-3321', title: 'Plastique HDPE (Bouchons)', weight: '12.5 kg', price: '60.00 FCFA', status: 'Draft', date: '10 Oct 2023', views: 0 },
];

const MyListing: React.FC<MyListingsModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // <-- NOUVEAU STATE POUR GERER L'OUVERTURE DE LA MODALE DES ACHETEURS
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Sold': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <>

      {selectedListing && (
        <BuyersModal 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
        />
      )}


      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans p-4">
        
        <main className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
          
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-green-600" />
                My Listings
              </h2>
              <p className="text-sm text-gray-500 mt-1">Gérez vos annonces de matériaux recyclables en cours et passées.</p>
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une annonce par titre ou ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none text-gray-600 cursor-pointer">
                <option>Tous les statuts</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="space-y-4">
              {mockListings
                .filter(listing => listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || listing.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((listing, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group bg-white">
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Package className="text-gray-400" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{listing.id}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusStyle(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{listing.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{listing.weight}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{listing.date}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1"><Eye size={14}/> {listing.views} vues</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className="font-bold text-lg text-gray-900 md:text-right">{listing.price}</div>
                    
                    {/* BOUTONS D'ACTION (Éditer, Voir les acheteurs) */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                        <Edit2 size={18} />
                      </button>
                      
                      {/* Le bouton pour ouvrir les acheteurs (sauf si c'est vendu ou brouillon) */}
                      {(listing.status === 'Active' || listing.status === 'Pending') && (
                        <button 
                          onClick={() => setSelectedListing(listing)} // <-- DÉCLENCHE LA MODALE
                          className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                        >
                          <Users size={16} />
                          Voir acheteurs
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default MyListing;