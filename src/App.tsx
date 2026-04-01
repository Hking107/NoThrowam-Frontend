import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignIn } from "./pages/SignIn";
import { Signup } from "./pages/Signup";
import { WebSocketProvider } from "./WebSocketProvider";
import CustomerMain from "./Customer_Section/CustomerMain";
import ManagerMain from "./Manager_Section/ManagerMain";
import SellerDashboard from "./Seller_Section/SellerDashboard";
// import ManagerMain from "./Manager_Section/ManagerMain";
// import CustomerMain from "./Customer_Section/CustomerMain";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/" element={<ManagerMain/>} /> */}
        {/* <Route path="/" element={<CustomerMain/>} /> */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard_customer" element={<CustomerMain/>} />
        <Route path="/manager" element={<ManagerMain />} />
        <Route path="/dashboard_seller" element={<SellerDashboard/>} />
        <Route path="/signup" element={<Signup />} >
        </Route>
      </Routes>
    </Router>

    
  );
}

export default App;