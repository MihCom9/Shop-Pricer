import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import Login from "./pages/Login/Login";

function App() {
  return (
   <Router>
      <div>
        <header className="max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <Navbar /> 
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
   </Router>
  );
}

export default App;
