import { useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Signup() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".signup-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      ).fromTo(
        ".role-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out" },
        "-=0.3",
      );
    },
    { scope: containerRef },
  );

  const roles = [
    {
      id: "customer",
      title: "I want to Buy/Report",
      roleName: "Customer",
      description: "Find sustainable materials or report waste in your area.",
      icon: <User size={32} className="text-brand-green" />,
      colorClass: "border-b-brand-green",
      hoverBg: "hover:bg-brand-green/5",
      path: "/signup/customer",
    },
    {
      id: "seller",
      title: "I want to Sell Waste",
      roleName: "Seller",
      description: "Turn your recyclables into a source of income easily.",
      icon: <ShoppingBag size={32} className="text-brand-yellow" />,
      colorClass: "border-b-brand-yellow",
      hoverBg: "hover:bg-brand-yellow/5",
      path: "/signup/seller",
    },
    {
      id: "manager",
      title: "Official Partner",
      roleName: "Manager",
      description: "Oversee collection points and manage operations.",
      icon: <ShieldCheck size={32} className="text-brand-red" />,
      colorClass: "border-b-brand-red",
      hoverBg: "hover:bg-brand-red/5",
      path: "/signup/manager",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-brand-surface p-6 relative overflow-hidden"
    >
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header Section */}
      <div className="signup-header flex flex-col items-center mb-12 relative z-10 w-full max-w-2xl px-4">
        <div className="mb-6">
          <Logo />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-brand-text text-center tracking-tight leading-tight">
          Join the Movement
        </h1>
        <p className="text-brand-text/60 text-center mt-4 text-lg font-medium max-w-lg">
          Choose your role below to start making Cameroon cleaner and more
          sustainable.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => navigate(role.path)}
            className={`role-card flex flex-col p-8 bg-white rounded-4xl border border-black/5 shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border-b-4 ${role.colorClass} ${role.hoverBg} text-left group cursor-pointer`}
          >
            <div className="mb-6 p-4 bg-brand-surface rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
              {role.icon}
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">
              {role.title}
            </h3>
            <p className="text-brand-text/60 font-medium mb-8 leading-relaxed">
              {role.description}
            </p>
            <div className="mt-auto flex items-center gap-2 text-brand-green font-bold text-sm uppercase tracking-wider">
              <span>Sign Up as {role.roleName}</span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Footer / Login Link */}
      <div className="signup-header mt-16 relative z-10 text-center">
        <p className="text-brand-text/60 font-medium text-lg">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-brand-green font-bold hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>

      {/* Back to Home */}
      <button
        onClick={() => navigate("/")}
        className="signup-header fixed top-8 left-8 p-3 rounded-full bg-white border border-black/5 shadow-sm text-brand-text/40 hover:text-brand-text transition-all hover:scale-110 z-50 cursor-pointer"
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  );
}
