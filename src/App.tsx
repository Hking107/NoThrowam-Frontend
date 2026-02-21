import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { LandingPage } from "./pages/LandingPage";
import { SignIn } from "./pages/SignIn";
import { Signup } from "./pages/Signup";
import { Customer_SI } from "./pages/Up/Customer_SI";
import { Manager_SI } from "./pages/Up/Manager_SI";
import { Seller_SI } from "./pages/Up/Seller_SI";
import ManagerMain from "./Manager_Section/ManagerMain";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/" element={<ManagerMain/>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/customer" element={<Customer_SI />} />
        <Route path="/manager" element={<Manager_SI />} />
        <Route path="/seller" element={<Seller_SI />} />
        <Route path="/signup" element={<Signup />} >
        </Route>
      </Routes>
    </Router>
  );
}

export default App;