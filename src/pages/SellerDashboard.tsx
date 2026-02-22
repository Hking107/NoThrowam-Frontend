import React, { useEffect, useState } from 'react'; 
import { 
  LayoutDashboard, List, ShoppingBag, Wallet, BarChart3, Backpack,
  Settings, Bell, Plus, TrendingUp, TrendingDown, 
  DollarSign, Scale, FileText, Leaf, MoreHorizontal, Filter, Download,
  LogOut
} from 'lucide-react';

import WasteScannerModal from '../components/WasteScannerModal';
import MyListingsModal from '../components/MyListing';
import ProductModal from '../components/ProductModal'; 



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
 
  const [userEmail, setUserEmail] = useState<string>("Chargement...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); 
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          setUserEmail("Non connecté");
          return;
        }

        const response = await fetch("/api/v0/auth/me/", {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || data.username || "Utilisateur"); 
        } else {
          setUserEmail("Erreur de session");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        setUserEmail("Erreur réseau");
      }
    };

    fetchUserProfile();
  }, []);
  


const [chartData, setChartData] = useState({ /* ... */ });

  // NOUVEAU : State pour les Stats Cards
  const [dashboardStats, setDashboardStats] = useState({
    isLoading: true,
    totalEarnings: 0,
    totalWeight: 0,
    activeListings: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/v0/waste-posts/my/", {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
            "X-CSRFTOKEN": "yKwR20NnZY6dVjuL1eqmWjx2Ao3Q0bJsh7Ev2UlVZMoywOKTUmphBZ2f1URLCKZZ"
          }
        });

        if (response.ok) {
          const posts = await response.json(); // Ton tableau JSON

          // --- 1. CALCUL DES STATS CARDS ---
          let sumEarnings = 0;
          let sumWeight = 0;
          let activeCount = 0;

          posts.forEach((post: any) => {
            // Additionner les prix
            if (post.price !== null) {
              sumEarnings += Number(post.price);
            }
            // Additionner le poids (quantity est une string genre "1.00")
            if (post.quantity !== null) {
              sumWeight += parseFloat(post.quantity);
            }
            // Compter les annonces actives (qui ne sont ni brouillon ni rejetées)
            // Tu peux ajuster 'AVAILABLE', 'PUBLISHED', etc., selon ce que ton backend utilise pour les vraies annonces actives.
            activeCount++;
          });

          setDashboardStats({
            isLoading: false,
            totalEarnings: sumEarnings,
            totalWeight: sumWeight,
            activeListings: activeCount
          });


          // --- 2. CALCUL DU GRAPHIQUE (Code précédent) ---
          const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
          const currentDate = new Date();
          const last6Months = [];
          const monthlyTotals = [0, 0, 0, 0, 0, 0];

          for (let i = 5; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            last6Months.push(monthNames[d.getMonth()]);
          }

          posts.forEach((post: any) => {
            if (post.created_at && post.price !== null) {
              const postDate = new Date(post.created_at);
              const monthDiff = (currentDate.getFullYear() - postDate.getFullYear()) * 12 + (currentDate.getMonth() - postDate.getMonth());

              if (monthDiff >= 0 && monthDiff < 6) {
                monthlyTotals[5 - monthDiff] += Number(post.price); 
              }
            }
          });

          const maxTotal = Math.max(...monthlyTotals, 100); 
          const xPoints = [0, 20, 40, 60, 80, 100]; 
          
          const points = monthlyTotals.map((total, index) => {
            const x = xPoints[index];
            const y = 35 - ((total / maxTotal) * 30);
            return { x, y, value: total };
          });

          let curvePath = `M ${points[0].x},${points[0].y}`;
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            curvePath += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
          }

          setChartData({
            path: curvePath,
            fillPath: `${curvePath} L 100,40 L 0,40 Z`,
            highlight: points[5], 
            months: last6Months
          });
        }
      } catch (error) {
        console.error("Erreur de graphe:", error);
        // En cas d'erreur, on arrête le chargement quand même
        setDashboardStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);
useEffect(() => {
  // 1. Generate 6 random points across the X-axis (0, 20, 40, 60, 80, 100)
  const points = [0, 20, 40, 60, 80, 100].map(x => {
    // SVG Y-axis is inverted (0 is top, 40 is bottom). 
    // We want random points between 5 and 35 to keep it inside the viewbox.
    const y = Math.floor(Math.random() * 30) + 5; 
    
    // Calculate a fake dollar value based on the height (higher point = higher $)
    const value = Math.floor((40 - y) * 35); 
    
    return { x, y, value };
  });

  // 2. Build the smooth curve path
  let curvePath = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2; // Control point X (halfway between points)
    
    // Cubic bezier curve command
    curvePath += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }

  // 3. Pick a point to highlight (e.g., the 5th point / May)
  const highlightPoint = points[4];

  // 4. Update the state
  setChartData({
    path: curvePath,
    fillPath: `${curvePath} L 100,40 L 0,40 Z`, // Draw to bottom corners to close the fill
    highlight: highlightPoint
  });
}, []); // Empty array ensures this runs once per page load

useEffect(() => {
  const fetchAndCalculateStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/v0/waste-posts/", {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420"
          }
        });

        if (response.ok) {
          const data = await response.json();
          const posts = Array.isArray(data) ? data : (data.results || []);

          // 3. DO THE MATH
          let earnings = 0;
          let weight = 0;
          let activeCount = 0;

          posts.forEach((post: any) => {
            const status = (post.status || "").toLowerCase();
            
            // Count Active Listings
            if (status === 'active' || status === 'pending') {
              activeCount += 1;
            }

            // Calculate Earnings and Weight (Usually, you only count 'sold' items for earnings)
            // Adjust the condition below if you want to sum up ALL items instead of just sold ones
            if (status === 'sold') {
              // Convert to numbers before adding (fallback to 0 if null)
              earnings += parseFloat(post.price || post.estimated_price || 0);
              weight += parseFloat(post.quantity || post.weight || 0);
            }
          });

          // Update the state with our final calculations
          setDashboardStats({
            totalEarnings: earnings,
            totalWeight: weight,
            activeListings: activeCount,
            isLoading: false
          });

        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDashboardStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchAndCalculateStats();
  }, []);
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
              <img src="" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              {/* On remplace "User user" par la variable d'état */}
              <p className="text-sm font-bold text-gray-900">{userEmail}</p>
              <p className="text-xs text-gray-500">Premium Seller</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <LogOut size={20} />
            Log out
          </button>
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
            <StatCard 
              icon={<DollarSign size={20} className="text-green-600"/>} 
              bg="bg-green-100" 
              title="Total Earnings" 
              value={dashboardStats.isLoading ? "..." : "22,000 FCFA"} 
              trend="+12%" // Trend usually requires historical data, leaving static for now
              positive={true} 
            />
            <StatCard 
              icon={<Scale size={20} className="text-blue-600"/>} 
              bg="bg-blue-100" 
              title="Weight Recycled" 
              value={dashboardStats.isLoading ? "..." : `120 kg`} 
              trend="+5%" 
              positive={true} 
            />
            <StatCard 
              icon={<FileText size={20} className="text-orange-600"/>} 
              bg="bg-orange-100" 
              title="Active Listings" 
              value={dashboardStats.isLoading ? "..." : "7"} 
              trend="0%" 
              positive={null} 
            />
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
                    <span className="text-2xl font-bold text-gray-900">120kg</span>
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
      {/* <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive === true ? 'bg-green-100 text-green-700' : positive === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        {positive === true && <TrendingUp size={12} />}
        {positive === false && <TrendingDown size={12} />}
        {trend}
      </div> */}
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

