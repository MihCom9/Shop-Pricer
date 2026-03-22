import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="rounded-xl border border-gray-100 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-8 max-w-4xl mx-auto">
        <div className="w-[20%]">
          <Link to="/" className="text-base font-bold tracking-tight text-gray-900">
            Shop<span className="text-gray-400">-Pricer</span>
          </Link>
        </div>
        <ul className="flex list-none gap-7 mr-auto">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
              }
            >
              Shop
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/promotions"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
              }
            >
              Promotions
            </NavLink>
          </li>
        </ul>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              <span className="hidden sm:block max-w-[140px] truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${isActive ? "" : "hover:border-gray-900 hover:text-gray-900"} ${isActive ? "text-white bg-black border-black" : "border-gray-300 text-gray-700"}`
            }
          >
            Get Started
          </NavLink>
        )}
      </div>
    </nav>
  );
}
