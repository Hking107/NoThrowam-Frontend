import React, { useState } from 'react'; 
import { 
  LayoutDashboard, List, ShoppingBag, Wallet, BarChart3, Backpack,
  Settings, Bell, Plus, TrendingUp, TrendingDown, 
  DollarSign, Scale, FileText, Leaf, MoreHorizontal, Filter, Download,
  LogOut
} from 'lucide-react';

import WasteScannerModal from '../components/WasteScannerModal';
import MyListingsModal from '../components/MyListing';
import ProductModal from '../components/ProductModal'; 

// --- DÉFINITION DES TYPES ---

interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
  trend: string;
  positive: boolean | null;
}

interface TableRowProps {
  date: string;
  type: string;
  icon: React.ReactNode;
  id: string;
  weight: string;
  price: string;
  status: 'Completed' | 'Processing' | 'Pending';
}

const SellerDashboard: React.FC = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); 
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {isModalOpen && (
        <WasteScannerModal onClose={() => setIsModalOpen(false)} />
      )}
      {isMyListingsOpen && (<MyListingsModal onClose={() => setIsMyListingsOpen(false)} />
      )}
      {isProductModalOpen && <ProductModal onClose={() => setIsProductModalOpen(false)} />}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-green-500 text-white p-2 rounded-lg">
              <Leaf size={24} />
            </div>
            <div className="py-3">
              <h1 className="text-xl font-bold text-gray-900">NoThrowam</h1>
              <p className="text-xs text-gray-500 ">Seller Dashboard</p>
            </div>
          </div>

          <nav className="px-4 py-5 mt-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
              <LayoutDashboard size={20} />
              Dashboard
            </a>
            <button 
              onClick={() => setIsMyListingsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <List size={20} />
              My Listings
            </button>
            
            <a href="#" className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                Orders
              </div>
              {/* <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span> */}
            </a>
            
           <button 
            onClick={() => setIsProductModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            <Backpack size={20} />
            Products
          </button>

          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium mb-4">
            <Settings size={20} />
            Settings
          </a>

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=32" alt="Alex Morgan" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">User user</p>
              <p className="text-xs text-gray-500">Premium Seller</p>
            </div>
          </div>

          <a href="#" className="flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-gray-50 rounded-xl font-medium mb-4">
            <LogOut size={20} />
            Log out
          </a>
          
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Welcome back, ready to make an impact today?</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm">
                <Bell size={20} />
              </button>
              
              {/* <-- 5. Ajout du onClick sur ce bouton pour ouvrir la modale ! */}
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-green-200"
              >
                <Plus size={20} />
                Create Listing
              </button>
              
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<DollarSign size={20} className="text-green-600"/>} bg="bg-green-100" title="Total Earnings" value="$1,240.50" trend="+12%" positive={true} />
            <StatCard icon={<Scale size={20} className="text-blue-600"/>} bg="bg-blue-100" title="Weight Recycled" value="450 kg" trend="+5%" positive={true} />
            <StatCard icon={<FileText size={20} className="text-orange-600"/>} bg="bg-orange-100" title="Active Listings" value="12" trend="0%" positive={null} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Sales Performance</h3>
                  <p className="text-sm text-gray-500">Total revenue over time</p>
                </div>
                <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="h-64 w-full relative">
                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,30 C10,30 15,25 25,25 C35,25 40,15 50,15 C60,15 65,35 75,35 C85,35 90,5 100,0 L100,40 L0,40 Z" fill="url(#greenGradient)" />
                  <path d="M0,30 C10,30 15,25 25,25 C35,25 40,15 50,15 C60,15 65,35 75,35 C85,35 90,5 100,0" fill="none" stroke="#22c55e" strokeWidth="1" />
                  <circle cx="85" cy="18" r="1.5" fill="#22c55e" className="ring-4 ring-white" />
                </svg>
                <div className="absolute right-[12%] top-[35%] bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded">
                  $840
                </div>
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 px-2">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Material Mix</h3>
              <p className="text-sm text-gray-500 mb-6">Distribution by weight</p>
              
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path className="text-yellow-400" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="15 100" />
                    <path className="text-blue-500" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="30 100" strokeDashoffset="-15" />
                    <path className="text-green-500" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="55 100" strokeDashoffset="-45" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-gray-900">450kg</span>
                  </div>
                </div>

                <div className="flex justify-between w-full mt-6 text-sm">
                  <div className="flex flex-col items-center"><span className="flex items-center gap-1 font-semibold"><div className="w-2 h-2 rounded-full bg-green-500"></div>Plastic</span><span className="text-gray-500">55%</span></div>
                  <div className="flex flex-col items-center"><span className="flex items-center gap-1 font-semibold"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Paper</span><span className="text-gray-500">30%</span></div>
                  <div className="flex flex-col items-center"><span className="flex items-center gap-1 font-semibold"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Metal</span><span className="text-gray-500">15%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-sm text-gray-500">Track your latest sales and status</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Filter size={16} /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-400 font-medium text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Material Type</th>
                    <th className="px-6 py-4">Listing ID</th>
                    <th className="px-6 py-4">Weight (kg)</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <TableRow date="Oct 24, 2023" type="HDPE Plastic" icon={<div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center"><Leaf size={16}/></div>} id="#PL-8832" weight="45.5" price="$124.00" status="Completed" />
                  <TableRow date="Oct 22, 2023" type="Aluminum Scraps" icon={<div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><FileText size={16}/></div>} id="#AL-2201" weight="120.0" price="$360.50" status="Processing" />
                  <TableRow date="Oct 20, 2023" type="Cardboard Bales" icon={<div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><FileText size={16}/></div>} id="#CA-5541" weight="200.0" price="$85.20" status="Pending" />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- COMPOSANTS SECONDAIRES TYPÉS ---

const StatCard: React.FC<StatCardProps> = ({ icon, bg, title, value, trend, positive }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
    <div className="flex justify-between items-start z-10 relative">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive === true ? 'bg-green-100 text-green-700' : positive === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        {positive === true && <TrendingUp size={12} />}
        {positive === false && <TrendingDown size={12} />}
        {trend}
      </div>
    </div>
    <div className="mt-4 z-10 relative">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

const TableRow: React.FC<TableRowProps> = ({ date, type, icon, id, weight, price, status }) => {
  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3 font-medium text-gray-900">
        {icon}
        {type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{id}</td>
      <td className="px-6 py-4 whitespace-nowrap font-mono">{weight}</td>
      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{price}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
};

export default SellerDashboard;