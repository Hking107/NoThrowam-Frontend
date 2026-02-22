import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, Package, Eye, X, Users, Loader2 } from 'lucide-react';
import BuyersModal from './BuyerModal'; 

interface MyListingsModalProps {
  onClose: () => void;
}

const MyListing: React.FC<MyListingsModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  
  // 1. NOUVEAUX STATES POUR L'API
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. RÉCUPÉRATION DES DONNÉES (FETCH)
  useEffect(() => {
    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        // On récupère le token de l'utilisateur connecté (ou tu peux le coder en dur pour tester)
        const token = localStorage.getItem("token") ; 
        
        const response = await fetch('/api/v0/waste-posts/my/', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true' // Très important pour que ngrok ne bloque pas la requête
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Si ton backend renvoie { results: [...] }, on prend data.results, sinon data
          setListings(data.results ? data.results : data);
        } else {
          console.error("Erreur serveur :", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      } finally {
        setIsLoading(false); // On arrête le chargement quoi qu'il arrive
      }
    };

    fetchMyListings();
  }, []); // Le tableau vide [] signifie "Exécuter une seule fois au démarrage"

  // 3. ADAPTATION DU STYLE SELON LE STATUT
  const getStatusStyle = (s: string) => {
    // On sécurise avec toLowerCase() au cas où l'API renvoie "active", "ACTIVE", etc.
    switch(s?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'sold': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
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

      {/* LA MODALE PRINCIPALE */}
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
                placeholder="Rechercher une annonce..." 
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
              
              {/* 4. GESTION DE L'AFFICHAGE SELON L'ÉTAT (Chargement, Vide, ou Liste) */}
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-green-500" size={32} />
                  <span className="ml-3 text-gray-500">Chargement de tes annonces...</span>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Tu n'as aucune annonce pour le moment.</p>
                </div>
              ) : (
                listings
                  .filter(listing => {
                    // On vérifie que les champs existent avant de chercher dedans
                    const title = listing.title || listing.category || "";
                    return title.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .map((listing, index) => (
                  <div key={listing.id || index} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group bg-white">
                    
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        {/* Si l'API renvoie une image_url, on peut l'afficher, sinon on met l'icône */}
                        {listing.image_url ? (
                          <img src={listing.image_url} alt="déchet" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">ID: {listing.id}</span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusStyle(listing.status || 'Active')}`}>
                            {listing.status || 'Active'}
                          </span>
                        </div>
                        {/* On s'adapte aux noms de variables de ton API */}
                        <h3 className="font-bold text-gray-900">{listing.title || listing.category || 'Annonce sans titre'}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{listing.quantity || listing.weight || 0} {listing.unit || 'kg'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Date inconnue'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 shrink-0">
                      <div className="font-bold text-lg text-gray-900 md:text-right">
                        {listing.price || listing.estimated_price || 0} FCFA
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                          <Edit2 size={18} />
                        </button>
                        
                        {/* Bouton Acheteurs */}
                        {((listing.status || 'active').toLowerCase() !== 'sold') && (
                          <button 
                            onClick={() => setSelectedListing(listing)}
                            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                          >
                            <Users size={16} />
                            Voir acheteurs
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default MyListing;