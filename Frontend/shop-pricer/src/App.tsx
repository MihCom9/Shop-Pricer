// @ts-nocheck
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SearchPage from "./pages/Search/SearchPage";
import PromotionsPage from "./pages/Promotions/PromotionsPage";
import AiAssistant from "./pages/Ai/AiAssistant";
import type { SearchRequestItem, ShoppingListStructure } from "./types";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [cart, setCart] = useState([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingListStructure[]>(() =>{
    const stored = localStorage.getItem("shoppingLists");
    return stored? JSON.parse(stored) : [];
  });
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() =>{
      localStorage.setItem("shoppingLists",JSON.stringify(shoppingLists));
    },[shoppingLists])

  return (
    <Router>
      <div>
        <header className={`sticky top-0 z-50 bg-gray-50 transition-all duration-200 ${scrolled ? "py-0" : "py-2"}`}>
          <Navbar />
        </header>
        <main className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage shoppingLists={shoppingLists} setShoppingLists={setShoppingLists} 
                                                        selectedListId={selectedListId} setSelectedListId={setSelectedListId} />} />
            <Route path="/browse" element={<PromotionsPage shoppingLists={shoppingLists} setShoppingLists={setShoppingLists} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ai" element={<AiAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
