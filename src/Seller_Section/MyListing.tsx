import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Package, X, Users, Loader2 } from 'lucide-react';
import BuyersModal from './BuyerModal'; 
import { wasteService } from '../services/wasteService';

interface MyListingsModalProps {
  onClose: () => void;
}

const MyListing: React.FC<MyListingsModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = ['All Categories', 'Plastic', 'Metal', 'Paper', 'Compost', 'Glass', 'Other'];
  const statuses = ['All Statuses', 'ACTIVE', 'PENDING', 'PUBLISHED', 'DRAFT', 'RESERVED', 'SOLD', 'REJECTED'];

  useEffect(() => {
    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        const listingsData = await wasteService.getMyListings();
        setListings(listingsData);
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchMyListings();
  }, []);

  const getStatusStyle = (s: string) => {
    switch(s?.toUpperCase()) {
      case 'SOLD': return 'bg-green-100 text-green-700 border-green-200';
      case 'PUBLISHED': 
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESERVED': 
      case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryLabel = (listing: any): string => {
    if (!listing) return 'Uncategorized';
    if (typeof listing.category === 'string') return listing.category;
    if (listing.category?.label) return listing.category.label;
    if (listing.category?.name) return listing.category.name;
    return 'Uncategorized';
  };

  const filteredListings = listings.filter(listing => {
    const title = listing.title || getCategoryLabel(listing) || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || (listing.status && listing.status.toUpperCase() === statusFilter);
    const listingCategory = getCategoryLabel(listing);
    const matchesCategory = categoryFilter === 'All Categories' || listingCategory.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
              <p className="text-sm text-gray-500 mt-1">Manage your active and past recyclable material listings.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 rounded-full p-2 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Search listings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1 shrink-0">
                <Filter size={14} className="text-gray-400" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent text-sm outline-none text-gray-700 cursor-pointer">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1 shrink-0">
                <Filter size={14} className="text-gray-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm outline-none text-gray-700 cursor-pointer">
                  {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="space-y-4">
              
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-green-500" size={32} />
                  <span className="ml-3 text-gray-500">Loading your listings...</span>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-lg font-medium text-gray-700">No listings found.</p>
                </div>
              ) : (
                filteredListings.map((listing, index) => {
                  const categoryName = getCategoryLabel(listing);
                  const displayStatus = listing.status ? listing.status.toUpperCase() : 'UNKNOWN';

                  return (
                    <div key={listing.id || index} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group bg-white">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {listing.image_url || listing.image ? (
                            <img src={listing.image_url || listing.image} alt="Waste item" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-400">ID: #{listing.id}</span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusStyle(displayStatus)}`}>
                              {displayStatus}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900">{listing.title || 'Untitled Listing'}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">{categoryName}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{listing.quantity || listing.weight || 0} {listing.unit || 'kg'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 shrink-0">
                        <div className="font-bold text-lg text-gray-900 md:text-right">
                          {listing.price || listing.estimated_price || 0} FCFA
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          
                          {displayStatus !== 'DRAFT' && (
                            <button 
                              onClick={() => {
                                console.log("Ouverture du modal pour l'annonce :", listing.id); // Ajout d'un log pour vérifier
                                setSelectedListing(listing);
                              }}
                              className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                            >
                              <Users size={16} />
                              View Buyers
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default MyListing;