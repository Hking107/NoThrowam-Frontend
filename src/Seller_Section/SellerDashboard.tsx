import React, { useEffect, useState } from 'react'; 
import { 
  LayoutDashboard, List,  Wallet, Backpack,
  Settings, Bell, Plus, DollarSign, Scale, FileText, Leaf, Filter, Download,
  LogOut
} from 'lucide-react';

import WasteScannerModal from './WasteScannerModal';
import MyListingsModal from './MyListing';
import ProductModal from './ProductModal'; 
import MaterialMixChart from '../components/Seller/MaterialMix';
import { StatCard } from '../components/Seller/StatCards';
import { TableRow } from '../components/Seller/TableRows';
import WalletModal from './WalletModal';

import { usePosts } from '../hooks/usePosts';

const SellerDashboard: React.FC = () => {
 
  const [userEmail, setUserEmail] = useState<string>("Chargement...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); 
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isOpenWallet, setIsOpenWallet ] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const {posts } = usePosts();
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  
  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       const token = localStorage.getItem("token"); 
  //       if (!token) {
  //         setUserEmail("Non connecté");
  //         return;
  //       }

  //       const response = await fetch("/api/v0/auth/me/", {
  //         method: "GET",
  //         headers: {
  //           "accept": "application/json",
  //           "Authorization": `Bearer ${token}`,
  //           "ngrok-skip-browser-warning": "69420"
  //         }
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setUserEmail(data.email || data.username || "Utilisateur"); 
  //       } else {
  //         setUserEmail("Erreur de session");
  //       }
  //     } catch (error) {
  //       console.error("Erreur réseau :", error);
  //       setUserEmail("Erreur réseau");
  //     }
  //   };

  //   fetchUserProfile();
  // }, []);
  
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
          setUserId(data.id); 
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

  useEffect(() => {
    if (userId !== null && posts.length > 0) {
      const filteredPosts = posts.filter(p => p.seller === userId);
      // On trie du plus récent au plus ancien
      filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyPosts(filteredPosts);
    }
  }, [posts, userId]);


useEffect(() => {
    if (!myPosts) return;

    let sumEarnings = 0;
    let sumWeight = 0;
    let activeCount = 0;

    myPosts.forEach((post: any) => {
      if (post.price) sumEarnings += Number(post.price);
      if (post.quantity) sumWeight += parseFloat(post.quantity);
      if (post.status === "PUBLISHED") activeCount++;
    });

    setDashboardStats({
      isLoading: false,
      totalEarnings: sumEarnings,
      totalWeight: sumWeight,
      activeListings: activeCount
    });

    // --- Calcul du Graphique ---
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const currentDate = new Date();
    const last6Months = [];
    const monthlyTotals = [0, 0, 0, 0, 0, 0];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(monthNames[d.getMonth()]);
    }

    myPosts.forEach((post: any) => {
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

  }, [myPosts]);

  const [chartData, setChartData] = useState({});

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
            "ngrok-skip-browser-warning": "69420"
          }
        });

        if (response.ok) {
          const posts = await response.json(); 
          
          setRecentPosts(posts);

          let sumEarnings = 0;
          let sumWeight = 0;
          let activeCount = 0;

          posts.forEach((post: any) => {
            if (post.price) sumEarnings += Number(post.price);
            
            if (post.quantity) sumWeight += parseFloat(post.quantity);
            
            if (post.status === "PUBLISHED") {
              activeCount++;
            }
          });

          setDashboardStats({
            isLoading: false,
            totalEarnings: sumEarnings,
            totalWeight: sumWeight,
            activeListings: activeCount
          });

          setDashboardStats({
            isLoading: false,
            totalEarnings: sumEarnings,
            totalWeight: sumWeight,
            activeListings: activeCount
          });

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
        console.error("Erreur de dashboard:", error);
        setDashboardStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchDashboardData();
  }, []);

useEffect(() => {
  const points = [0, 20, 40, 60, 80, 100].map(x => {
    const y = Math.floor(Math.random() * 30) + 5; 
    
    const value = Math.floor((40 - y) * 35); 
    
    return { x, y, value };
  });

  let curvePath = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2; 
    
    curvePath += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }

  const highlightPoint = points[4];

  // 4. Update the state
  setChartData({
    path: curvePath,
    fillPath: `${curvePath} L 100,40 L 0,40 Z`, 
    highlight: highlightPoint
  });
}, []); 


  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {isModalOpen && (
        <WasteScannerModal onClose={() => setIsModalOpen(false)} />
      )}
      {isMyListingsOpen && (<MyListingsModal onClose={() => setIsMyListingsOpen(false)} />
      )}
      {isProductModalOpen && <ProductModal onClose={() => setIsProductModalOpen(false)} />}

      {isOpenWallet && <WalletModal onClose= {() => setIsOpenWallet(false)}/>}  

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between md:flex">
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

          <button 
            onClick={() => setIsOpenWallet(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            <Wallet size={20} />
            Wallet
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
            value={dashboardStats.isLoading ? "..." : `${(dashboardStats.totalEarnings || 0).toLocaleString()} FCFA`} 
            trend="+12%" 
            positive={true} 
          />
          <StatCard 
            icon={<Scale size={20} className="text-blue-600"/>} 
            bg="bg-blue-100" 
            title="Weight Recycled" 
            value={dashboardStats.isLoading ? "..." : `${(dashboardStats.totalWeight || 0).toFixed(1)} kg`} 
            trend="+5%" 
            positive={true} 
          />
          <StatCard 
            icon={<FileText size={20} className="text-orange-600"/>} 
            bg="bg-orange-100" 
            title="Active Listings" 
            value={dashboardStats.isLoading ? "..." : `${dashboardStats.activeListings || 0}`} 
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

            <MaterialMixChart 
              posts={recentPosts} 
              isLoading={dashboardStats.isLoading} 
              totalWeight={dashboardStats.totalWeight} 
            />
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
                  {/* 🆕 6. On map sur myPosts au lieu de recentPosts */}
                  {myPosts.length > 0 ? (
                    myPosts.map((post) => (
                      <TableRow 
                        key={post.id}
                        date={new Date(post.created_at).toLocaleDateString()} 
                        type={post.title || post.category?.label || "Unknown Material"} 
                        icon={<div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center"><Leaf size={16}/></div>} 
                        id={`#${post.id}`} 
                        weight={`${post.quantity || 0} ${post.unit || 'kg'}`} 
                        price={`${post.price || 0} FCFA`} 
                        status={post.status} 
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No transactions found yet. Scan some waste to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};



export default SellerDashboard;

