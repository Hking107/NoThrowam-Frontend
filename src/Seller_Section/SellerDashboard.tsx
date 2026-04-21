import React, { useEffect, useState, useRef } from 'react'; 
import { 
  LayoutDashboard, List, Wallet, Backpack,
  Settings, Bell, Plus, DollarSign, Scale, FileText, Recycle, Filter,
  LogOut, Search, ChevronRight, ChevronsLeft, TrendingUp, Menu, X, Leaf
} from 'lucide-react';
import { gsap } from 'gsap';

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
  
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sidebar Entrance
      gsap.fromTo(sidebarRef.current, 
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // Main Content Entrance
      gsap.fromTo(mainRef.current, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );

      // Staggered Stat Cards
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children, 
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            delay: 0.4,
            ease: "power2.out"
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/signin";
  };

  
  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       const token = localStorage.getItem("access_token"); 
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
        const token = localStorage.getItem("access_token"); 
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
        const token = localStorage.getItem("access_token");
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
    <div className="flex min-h-screen bg-[#fcfdfb] font-sans text-gray-800 selection:bg-emerald-100 selection:text-emerald-900">
      
      {isModalOpen && (
        <WasteScannerModal onClose={() => setIsModalOpen(false)} />
      )}
      {isMyListingsOpen && (<MyListingsModal onClose={() => setIsMyListingsOpen(false)} />
      )}
      {isProductModalOpen && <ProductModal onClose={() => setIsProductModalOpen(false)} />}

      {isOpenWallet && <WalletModal onClose={() => setIsOpenWallet(false)} balance={dashboardStats.totalEarnings} />}  

      {/* --- SIDEBAR --- */}
      <aside 
        ref={sidebarRef}
        className={`glass-sidebar flex flex-col justify-between fixed md:sticky top-0 h-screen z-50 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Collapse toggle button — desktop only */}
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="hidden md:flex absolute -right-3 top-8 z-[60] w-6 h-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-300"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronsLeft size={14} className={`transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="overflow-hidden">
          <div className={`flex items-center gap-4 transition-all duration-500 ${isSidebarCollapsed ? 'p-4 justify-center' : 'p-8'}`}>
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200/50 shrink-0">
              <Recycle size={26} strokeWidth={2.5} />
            </div>
            <div className={`transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">NoThrowam</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Premium Seller</p>
              </div>
            </div>
          </div>

          <nav className={`py-6 space-y-2 transition-all duration-500 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
            <a href="#" className={`group flex items-center bg-emerald-50/50 text-emerald-700 rounded-2xl font-semibold transition-all hover:translate-x-1 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'}`} title="Dashboard">
              <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                <LayoutDashboard size={20} className="text-emerald-600 shrink-0" />
                <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Dashboard</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isSidebarCollapsed ? 'hidden' : ''}`} />
            </a>
            
            <button 
              onClick={() => setIsMyListingsOpen(true)}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'}`}
              title="My Listings"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                <List size={20} className="shrink-0" />
                <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>My Listings</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 hover:opacity-100 ${isSidebarCollapsed ? 'hidden' : ''}`} />
            </button>
            
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'}`}
              title="Products"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                <Backpack size={20} className="shrink-0" />
                <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Products</span>
              </div>
            </button>

            <button 
              onClick={() => setIsOpenWallet(true)}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'}`}
              title="Wallet"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                <Wallet size={20} className="shrink-0" />
                <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Wallet</span>
              </div>
            </button>
          </nav>
        </div>

        <div className={`border-t border-gray-100/50 transition-all duration-500 ${isSidebarCollapsed ? 'p-2' : 'p-6'}`}>
          <button 
            className={`w-full flex items-center text-gray-500 hover:bg-gray-50 rounded-2xl font-medium transition-all mb-4 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'}`}
            title="Settings"
          >
            <Settings size={20} className="shrink-0" />
            <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Settings</span>
          </button>

          <div className={`bg-gray-50/50 rounded-3xl mb-4 border border-gray-100 transition-all duration-500 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm overflow-hidden shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  <div className="w-1 h-1 rounded-full bg-green-400"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'}`}
            title="Log out"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main ref={mainRef} className="flex-1 w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <Recycle size={18} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-tight">NoThrowam</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="px-8 py-4 max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <span className="text-sm">Welcome back,</span>
                <span className="text-sm font-bold text-emerald-600">{userEmail.split('@')[0]}</span>
                <span className="text-sm">— ready to make an impact?</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:max-w-xs group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all shadow-sm"
                />
              </div>
              
              <button className="p-3 text-gray-500 hover:text-emerald-600 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Listing</span>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
         <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-[2.5rem] lg:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Sales Performance</h3>
                  <p className="text-sm text-gray-400 font-medium">Revenue insights for the last 6 months</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">
                    <TrendingUp size={14} />
                    +24% vs last period
                  </div>
                  <select className="bg-gray-50/50 border border-gray-100 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </div>
              
              <div className="h-72 w-full relative group/chart">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-bold text-gray-300 py-2 z-10">
                  <span>1M</span><span>750k</span><span>500k</span><span>250k</span><span>0</span>
                </div>
                
                <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-[0_10px_20px_rgba(16,185,129,0.1)]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 10, 20, 30, 40].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  
                  {/* Area Fill */}
                  <path 
                    d={chartData.fillPath || "M0,40 L100,40 Z"} 
                    fill="url(#chartGradient)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  
                  {/* Line Path */}
                  <path 
                    d={chartData.path || "M0,40 L100,40"} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-all duration-1000 ease-in-out"
                    style={{ filter: 'url(#glow)' }}
                  />
                  
                  {/* Data Points */}
                  {chartData.months && [0, 20, 40, 60, 80, 100].map((x, i) => (
                    <circle 
                      key={x} 
                      cx={x} 
                      cy={35 - (Math.random() * 20)} // Placeholder cy, ideally from logic
                      r="1" 
                      fill="white" 
                      stroke="#10b981" 
                      strokeWidth="0.5"
                      className="opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300"
                    />
                  ))}

                  {/* Highlight Point */}
                  {chartData.highlight && (
                    <g>
                      <circle 
                        cx={chartData.highlight.x} 
                        cy={chartData.highlight.y} 
                        r="2.5" 
                        fill="#10b981" 
                        className="animate-pulse"
                      />
                      <circle 
                        cx={chartData.highlight.x} 
                        cy={chartData.highlight.y} 
                        r="5" 
                        fill="#10b981" 
                        fillOpacity="0.1" 
                      />
                    </g>
                  )}
                </svg>
                
                {/* X-Axis Labels */}
                <div className="absolute -bottom-6 w-full flex justify-between text-[10px] font-black text-gray-400 px-2 uppercase tracking-tighter">
                  {chartData.months?.map((m: string) => <span key={m}>{m}</span>) || 
                    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
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

