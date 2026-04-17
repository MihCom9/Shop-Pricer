import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SearchPage from "./pages/Search/SearchPage";
import PromotionsPage from "./pages/Promotions/PromotionsPage";
import AiAssistant from "./pages/Ai/AiAssistant";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <Router>
      <div>
        <header className={`sticky top-0 z-50 bg-gray-50 transition-all duration-200 ${scrolled ? "py-0" : "py-2"}`}>
          <Navbar />
        </header>
        <main className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage cart={cart} setCart={setCart} />} />
            <Route path="/browse" element={<PromotionsPage cart={cart} setCart={setCart} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ai" element={<AiAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
