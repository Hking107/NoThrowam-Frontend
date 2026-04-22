import React, { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  List,
  Wallet,
  Backpack,
  Settings,
  Bell,
  Plus,
  DollarSign,
  Scale,
  FileText,
  Recycle,
  Filter,
  LogOut,
  Search,
  ChevronRight,
  ChevronsLeft,
  TrendingUp,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { gsap } from "gsap";

import WasteScannerModal from "./WasteScannerModal";
import MyListingsModal from "./MyListing";
import ProductModal from "./ProductModal";
import MaterialMixChart from "../components/Seller/MaterialMix";
import { StatCard } from "../components/Seller/StatCards";
import { TableRow } from "../components/Seller/TableRows";
import WalletModal from "./WalletModal";

import { usePosts } from "../hooks/usePosts";

const SellerDashboard: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isOpenWallet, setIsOpenWallet] = useState(false);
  const [isOpenWallet, setIsOpenWallet] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { posts } = usePosts();
  const { posts } = usePosts();
  const [myPosts, setMyPosts] = useState<any[]>([]);


  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sidebar Entrance
      gsap.fromTo(
        sidebarRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform",
        },
      );

      // Main Content Entrance
      gsap.fromTo(
        mainRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" },
      );

      // Staggered Stat Cards
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            delay: 0.4,
            ease: "power2.out",
          },
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const token = localStorage.getItem("access_token");
        if (!token) {
          setUserEmail("Non connecté");
          return;
        }

        const response = await fetch("/api/v0/auth/me/", {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
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
      const filteredPosts = posts.filter((p) => p.seller === userId);
      filteredPosts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setMyPosts(filteredPosts);
    }
  }, [posts, userId]);

  useEffect(() => {
    if (!myPosts) return;

    let sumEarnings = 0;
    let sumWeight = 0;
    let activeCount = 0;

    // Monthly buckets for trend calculation (current month vs previous month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let earningsThisMonth = 0;
    let earningsLastMonth = 0;
    let weightThisMonth = 0;
    let weightLastMonth = 0;
    let listingsThisMonth = 0;
    let listingsLastMonth = 0;

    myPosts.forEach((post: any) => {
      if (post.price) sumEarnings += Number(post.price);
      if (post.quantity) sumWeight += parseFloat(post.quantity);
      if (post.status === "PUBLISHED") activeCount++;

      // Bucket by month for trend calculation
      if (post.created_at) {
        const postDate = new Date(post.created_at);
        const postMonth = postDate.getMonth();
        const postYear = postDate.getFullYear();

        const isThisMonth =
          postMonth === currentMonth && postYear === currentYear;
        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const isLastMonth =
          postMonth === prevMonthDate.getMonth() &&
          postYear === prevMonthDate.getFullYear();

        if (isThisMonth) {
          earningsThisMonth += Number(post.price || 0);
          weightThisMonth += parseFloat(post.quantity || 0);
          listingsThisMonth++;
        } else if (isLastMonth) {
          earningsLastMonth += Number(post.price || 0);
          weightLastMonth += parseFloat(post.quantity || 0);
          listingsLastMonth++;
        }
      }
    });

    // Calculate percentage change helper
    const calcTrend = (
      current: number,
      previous: number,
    ): { text: string; positive: boolean | null } => {
      if (previous === 0 && current === 0)
        return { text: "0%", positive: null };
      if (previous === 0) return { text: "+100%", positive: true };
      const pct = Math.round(((current - previous) / previous) * 100);
      if (pct === 0) return { text: "0%", positive: null };
      return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct > 0 };
    };

    const earningsTrend = calcTrend(earningsThisMonth, earningsLastMonth);
    const weightTrend = calcTrend(weightThisMonth, weightLastMonth);
    const listingsTrend = calcTrend(listingsThisMonth, listingsLastMonth);

    setDashboardStats({
      isLoading: false,
      totalEarnings: sumEarnings,
      totalWeight: sumWeight,
      activeListings: activeCount,
      earningsTrend,
      weightTrend,
      listingsTrend,
    });

    // --- Calcul du Graphique ---
    const monthNames = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const currentDate = new Date();
    const last6Months = [];
    const monthlyTotals = [0, 0, 0, 0, 0, 0];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      last6Months.push(monthNames[d.getMonth()]);
    }

    myPosts.forEach((post: any) => {
      if (post.created_at && post.price !== null) {
        const postDate = new Date(post.created_at);
        const monthDiff =
          (currentDate.getFullYear() - postDate.getFullYear()) * 12 +
          (currentDate.getMonth() - postDate.getMonth());

        if (monthDiff >= 0 && monthDiff < 6) {
          monthlyTotals[5 - monthDiff] += Number(post.price);
          monthlyTotals[5 - monthDiff] += Number(post.price);
        }
      }
    });

    const maxTotal = Math.max(...monthlyTotals, 100);
    const xPoints = [0, 20, 40, 60, 80, 100];

    const maxTotal = Math.max(...monthlyTotals, 100);
    const xPoints = [0, 20, 40, 60, 80, 100];

    const points = monthlyTotals.map((total, index) => {
      const x = xPoints[index];
      const y = 35 - (total / maxTotal) * 30;
      return { x, y, value: total };
    });

    let curvePath = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      curvePath += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }

    // Calculate chart period trend (recent 3 months vs prior 3 months)
    const recentHalf = monthlyTotals[3] + monthlyTotals[4] + monthlyTotals[5];
    const priorHalf = monthlyTotals[0] + monthlyTotals[1] + monthlyTotals[2];
    let chartTrend = { text: "0%", positive: null as boolean | null };
    if (priorHalf === 0 && recentHalf === 0) {
      chartTrend = { text: "0%", positive: null };
    } else if (priorHalf === 0) {
      chartTrend = { text: "+100%", positive: true };
    } else {
      const pct = Math.round(((recentHalf - priorHalf) / priorHalf) * 100);
      chartTrend = {
        text: `${pct > 0 ? "+" : ""}${pct}%`,
        positive: pct === 0 ? null : pct > 0,
      };
    }

    setChartData({
      path: curvePath,
      fillPath: `${curvePath} L 100,40 L 0,40 Z`,
      highlight: points[5],
      months: last6Months,
      points: points,
      trend: chartTrend,
    });
  }, [myPosts]);

  const [chartData, setChartData] = useState<any>({});

  const [dashboardStats, setDashboardStats] = useState<any>({
    isLoading: true,
    totalEarnings: 0,
    totalWeight: 0,
    activeListings: 0,
    earningsTrend: { text: "0%", positive: null },
    weightTrend: { text: "0%", positive: null },
    listingsTrend: { text: "0%", positive: null },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch("/api/v0/waste-posts/my/", {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
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

          setDashboardStats((prev: any) => ({
            ...prev,
            isLoading: false,
            totalEarnings: sumEarnings,
            totalWeight: sumWeight,
            activeListings: activeCount,
          }));

          const monthNames = [
            "Jan",
            "Fév",
            "Mar",
            "Avr",
            "Mai",
            "Juin",
            "Juil",
            "Aoû",
            "Sep",
            "Oct",
            "Nov",
            "Déc",
          ];
          const currentDate = new Date();
          const last6Months = [];
          const monthlyTotals = [0, 0, 0, 0, 0, 0];

          for (let i = 5; i >= 0; i--) {
            const d = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - i,
              1,
            );
            last6Months.push(monthNames[d.getMonth()]);
          }

          posts.forEach((post: any) => {
            if (post.created_at && post.price !== null) {
              const postDate = new Date(post.created_at);
              const monthDiff =
                (currentDate.getFullYear() - postDate.getFullYear()) * 12 +
                (currentDate.getMonth() - postDate.getMonth());

              if (monthDiff >= 0 && monthDiff < 6) {
                monthlyTotals[5 - monthDiff] += Number(post.price);
              }
            }
          });

          const maxTotal = Math.max(...monthlyTotals, 100);
          const xPoints = [0, 20, 40, 60, 80, 100];

          const points = monthlyTotals.map((total, index) => {
            const x = xPoints[index];
            const y = 35 - (total / maxTotal) * 30;
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
            months: last6Months,
            points: points,
          });
        }
      } catch (error) {
        console.error("Erreur de dashboard:", error);
        setDashboardStats((prev) => ({ ...prev, isLoading: false }));
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const points = [0, 20, 40, 60, 80, 100].map((x) => {
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
    let curvePath = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;

      curvePath += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }

    const highlightPoint = points[4];
    const highlightPoint = points[4];

    // 4. Update the state
    setChartData({
      path: curvePath,
      fillPath: `${curvePath} L 100,40 L 0,40 Z`,
      highlight: highlightPoint,
      points: points,
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#fcfdfb] font-sans text-gray-800 selection:bg-emerald-100 selection:text-emerald-900">
      {isModalOpen && (
        <WasteScannerModal onClose={() => setIsModalOpen(false)} />
      )}
      {isMyListingsOpen && (
        <MyListingsModal onClose={() => setIsMyListingsOpen(false)} />
      )}
      {isProductModalOpen && (
        <ProductModal onClose={() => setIsProductModalOpen(false)} />
      )}

      {isOpenWallet && (
        <WalletModal
          onClose={() => setIsOpenWallet(false)}
          balance={dashboardStats.totalEarnings}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
      <aside
        ref={sidebarRef}
        className={`glass-sidebar flex flex-col justify-between fixed md:sticky top-0 h-screen z-50 transition-all duration-500 ease-in-out w-72 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        {/* Collapse pill — desktop only */}
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex absolute -right-3 top-8 z-60 w-6 h-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-300"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            size={14}
            className={`transition-transform duration-500 ${isSidebarCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Close drawer X — mobile only */}
        <button
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-[60]"
        >
          <X size={22} />
        </button>

        <div className="overflow-hidden">
          <div
            className={`flex items-center gap-4 transition-all duration-500 p-8 ${isSidebarCollapsed ? "md:p-4 md:justify-center" : ""}`}
          >
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200/50 shrink-0">
              <Recycle size={26} strokeWidth={2.5} />
            </div>
            <div
              className={`transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}
            >
              <h1 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                NoThrowam
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Premium Seller
                </p>
              </div>
            </div>
          </div>

          <nav
            className={`py-6 space-y-2 transition-all duration-500 px-6 ${isSidebarCollapsed ? "md:px-2" : ""}`}
          >
            <a
              href="#"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center bg-emerald-50/50 text-emerald-700 rounded-2xl font-semibold transition-all hover:translate-x-1 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""} justify-between px-4 py-3.5`}
              title="Dashboard"
            >
              <div
                className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:gap-0" : ""}`}
              >
                <LayoutDashboard
                  size={20}
                  className="text-emerald-600 shrink-0"
                />
                <span
                  className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
                >
                  Dashboard
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isSidebarCollapsed ? "md:hidden" : ""}`}
              />
            </a>

            <button
              onClick={() => {
                setIsMyListingsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""} justify-between px-4 py-3.5`}
              title="My Listings"
            >
              <div
                className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:gap-0" : ""}`}
              >
                <List size={20} className="shrink-0" />
                <span
                  className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
                >
                  My Listings
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`opacity-0 hover:opacity-100 ${isSidebarCollapsed ? "md:hidden" : ""}`}
              />
            </button>

            <button
              onClick={() => {
                setIsProductModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""} justify-between px-4 py-3.5`}
              title="Products"
            >
              <div
                className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:gap-0" : ""}`}
              >
                <Backpack size={20} className="shrink-0" />
                <span
                  className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
                >
                  Products
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpenWallet(true);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium transition-all hover:translate-x-1 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""} justify-between px-4 py-3.5`}
              title="Wallet"
            >
              <div
                className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:gap-0" : ""}`}
              >
                <Wallet size={20} className="shrink-0" />
                <span
                  className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
                >
                  Wallet
                </span>
              </div>
            </button>
          </nav>
        </div>

        <div
          className={`border-t border-gray-100/50 transition-all duration-500 p-6 ${isSidebarCollapsed ? "md:p-2" : ""}`}
        >
          <button
            className={`w-full flex items-center text-gray-500 hover:bg-gray-50 rounded-2xl font-medium transition-all mb-4 gap-3 px-4 py-3 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""}`}
            title="Settings"
          >
            <Settings size={20} className="shrink-0" />
            <span
              className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
            >
              Settings
            </span>
          </button>

          <div
            className={`bg-gray-50/50 rounded-3xl mb-4 border border-gray-100 transition-all duration-500 p-4 ${isSidebarCollapsed ? "md:p-2" : ""}`}
          >
            <div
              className={`flex items-center gap-3 ${isSidebarCollapsed ? "md:justify-center" : ""}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm overflow-hidden shrink-0">
                {userEmail ? (
                  userEmail.charAt(0).toUpperCase()
                ) : (
                  <div className="w-4 h-4 bg-emerald-200 animate-pulse rounded"></div>
                )}
              </div>
              <div
                className={`flex-1 min-w-0 transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}
              >
                {userEmail ? (
                  <>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {userEmail}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <div className="w-1 h-1 rounded-full bg-green-400"></div>
                      Online
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="w-24 h-3 skeleton opacity-60"></div>
                    <div className="w-16 h-2 skeleton opacity-30"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all gap-3 px-4 py-3 ${isSidebarCollapsed ? "md:justify-center md:px-0 md:py-3" : ""}`}
            title="Log out"
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "md:w-0 md:opacity-0" : ""}`}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* --- MAIN CONTENT --- */}
      <main ref={mainRef} className="flex-1 w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30">
          <div className="flex items-center gap-2">
            <button
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <Recycle size={18} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-tight">NoThrowam</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-emerald-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200/50"
            >
              <Plus size={16} />
              New
            </button> */}
          </div>
        </header>

        <div className="px-8 py-4 max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Dashboard Overview
              </h2>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <span className="text-sm">Welcome back,</span>
                <span className="text-sm lowercase font-bold text-emerald-600">
                  {userEmail ? (
                    userEmail.split("@")[0]
                  ) : (
                    <span className="inline-block w-20 h-3 skeleton-emerald align-middle mx-1"></span>
                  )}
                </span>
                {/* <span className="text-sm">— ready to make an impact?</span> */}
              </div>
            </div>


            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:max-w-xs group">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                />
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
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <StatCard
              icon={<DollarSign size={20} className="text-green-600" />}
              bg="bg-green-100"
              title="Total Earnings"
              value={`${(dashboardStats.totalEarnings || 0).toLocaleString()} FCFA`}
              trend={dashboardStats.earningsTrend.text}
              positive={dashboardStats.earningsTrend.positive}
              isLoading={dashboardStats.isLoading}
            />
            <StatCard
              icon={<Scale size={20} className="text-blue-600" />}
              bg="bg-blue-100"
              title="Weight Recycled"
              value={`${(dashboardStats.totalWeight || 0).toFixed(1)} kg`}
              trend={dashboardStats.weightTrend.text}
              positive={dashboardStats.weightTrend.positive}
              isLoading={dashboardStats.isLoading}
            />
            <StatCard
              icon={<FileText size={20} className="text-orange-600" />}
              bg="bg-orange-100"
              title="Active Listings"
              value={`${dashboardStats.activeListings || 0}`}
              trend={dashboardStats.listingsTrend.text}
              positive={dashboardStats.listingsTrend.positive}
              isLoading={dashboardStats.isLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl lg:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10"></div>


              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Sales Performance
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Revenue insights for the last 6 months
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      chartData.trend?.positive === true
                        ? "bg-emerald-50 text-emerald-600"
                        : chartData.trend?.positive === false
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {chartData.trend?.positive === true && (
                      <TrendingUp size={14} />
                    )}
                    {chartData.trend?.positive === false && (
                      <TrendingUp size={14} className="rotate-180" />
                    )}
                    {chartData.trend?.text || "0%"} vs last period
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
                  <span>1M</span>
                  <span>750k</span>
                  <span>500k</span>
                  <span>250k</span>
                  <span>0</span>
                </div>

                <svg
                  viewBox="0 0 100 40"
                  className="w-full h-full drop-shadow-[0_10px_20px_rgba(16,185,129,0.1)]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>


                  {/* Grid Lines */}
                  {[0, 10, 20, 30, 40].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="0.5"
                    />
                  ))}


                  {/* Area Fill */}
                  <path
                    d={chartData.fillPath || "M0,40 L100,40 Z"}
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
                  <path
                    d={chartData.path || "M0,40 L100,40"}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000 ease-in-out"
                  />


                  {/* Data Points */}
                  {chartData.points?.map((p: any) => (
                    <circle
                      key={p.x}
                      cx={p.x}
                      cy={p.y}
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
                  {chartData.months?.map((m: string) => (
                    <span key={m}>{m}</span>
                  )) ||
                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                </div>
              </div>
            </div>

            <MaterialMixChart
              posts={recentPosts}
              isLoading={dashboardStats.isLoading}
              totalWeight={dashboardStats.totalWeight}
            <MaterialMixChart
              posts={recentPosts}
              isLoading={dashboardStats.isLoading}
              totalWeight={dashboardStats.totalWeight}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-sm text-gray-500">
                  Track your latest sales and status
                </p>
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
                  {dashboardStats.isLoading ? (
                    // Transaction Skeletons
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 last:border-0 opacity-50"
                      >
                        <td className="px-6 py-5">
                          <div className="w-20 h-4 skeleton"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-32 h-6 skeleton rounded-xl"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-12 h-3 skeleton"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-16 h-4 skeleton"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-20 h-5 skeleton"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-24 h-8 skeleton rounded-xl"></div>
                        </td>
                        <td className="px-6 py-5"></td>
                      </tr>
                    ))
                  ) : myPosts.length > 0 ? (
                    myPosts.map((post) => (
                      <TableRow
                      <TableRow
                        key={post.id}
                        date={new Date(post.created_at).toLocaleDateString()}
                        type={
                          post.title ||
                          post.category?.label ||
                          "Unknown Material"
                        }
                        icon={
                          <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center">
                            <Leaf size={16} />
                          </div>
                        }
                        id={`#${post.id}`}
                        weight={`${post.quantity || 0} ${post.unit || "kg"}`}
                        price={`${post.price || 0} FCFA`}
                        status={post.status}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No transactions found yet. Scan some waste to get
                        started!
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
