import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignIn } from "./pages/SignIn";
import { Signup } from "./pages/Signup";
import { WebSocketProvider } from "./WebSocketProvider";
import { SellerSignup } from "./pages/SellerSignup";
import { CustomerSignup } from "./pages/CustomerSignup";
import { ManagerSignup } from "./pages/ManagerSignup";
import { VerifyOTP } from "./pages/VerifyOTP";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CustomerMain from "./Customer_Section/CustomerMain";
import ManagerMain from "./Manager_Section/ManagerMain";
import SellerDashboard from "./Seller_Section/SellerDashboard";
import { ReportWaste } from "./pages/ReportWaste";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/report-waste" element={<ReportWaste />} />
        
        {/* Signup Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/seller" element={<SellerSignup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/signup/manager" element={<ManagerSignup />} />
        
        {/* OTP Verification */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard_customer"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CustomerMain />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="MANAGER">
              <ManagerMain />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard_seller"
          element={
            <ProtectedRoute requiredRole="SELLER">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>

    
  );
}

export default App;