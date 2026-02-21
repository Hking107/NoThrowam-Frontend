import React, { useState } from 'react';
import { X, Search, Filter, ShoppingCart, Leaf } from 'lucide-react';

interface ProductModalProps {
  onClose: () => void;
}


const mockProducts = [
  { id: 'P-01', title: 'Clear PET Plastics', category: 'Plastic', price: '150 FCFA', stock: '500 kg', image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80' },
  { id: 'P-02', title: 'Crushed Aluminum Cans', category: 'Metal', price: '400 FCFA', stock: '120 kg', image: 'https://images.unsplash.com/photo-1550503192-3bc5505c2194?auto=format&fit=crop&w=400&q=80' },
  { id: 'P-03', title: 'Corrugated Cardboard', category: 'Paper', price: '50 FCFA', stock: '1000 kg', image: 'https://images.unsplash.com/photo-1605600659909-b78f4b005bd9?auto=format&fit=crop&w=400&q=80' },
  { id: 'P-04', title: 'Mixed Glass Bottles', category: 'Glass', price: '25 FCFA', stock: '300 kg', image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=400&q=80' },
  ];

const ProductModal: React.FC<ProductModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans p-4">
      
      <main className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Leaf className="text-green-600" />
              Waste Marketplace
            </h2>
            <p className="text-sm text-gray-500 mt-1">Browse available recyclable materials sorted by price per kg.</p>
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
              placeholder="Search by material type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none text-gray-600 cursor-pointer">
              <option>All Categories</option>
              <option>Plastic</option>
              <option>Metal</option>
              <option>Paper</option>
              <option>Glass</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts
              .filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((product) => (
              
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col">
                {/* Product Image */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm uppercase tracking-wide">
                    {product.category}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{product.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">Available: {product.stock}</p>
                   */}
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price / kg</p>
                      <p className="font-extrabold text-xl text-green-600">{product.price}</p>
                    </div>
                    
                    
                  </div>
                </div>
              </div>

            ))}
          </div>

          {/* Empty State */}
          {mockProducts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found matching "{searchTerm}".</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ProductModal;