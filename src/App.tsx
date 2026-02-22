import { LandingPage } from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SellerDashboard from "./pages/SellerDashboard";
import { Navigate } from "react-router-dom";
import { SignIn } from "./pages/SignIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
  <Router>
      <Routes>
        <Route path="/" element={<SignIn />} /> 
        {/* <Route path="/" element={</>} /> */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard_seller" element={<SellerDashboard />} />
        {/* <Route path="/manager" element={<Manager_SI />} />
        <Route path="/seller" element={<Seller_SI />} />
        <Route path="/signup" element={<Signup />} > */}
        {/* </Route> */}
      </Routes>
    </Router>
  );

}

export default App;
