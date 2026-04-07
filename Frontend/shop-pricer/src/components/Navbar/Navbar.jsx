import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('display_name, city_ekatte')
      .eq('id', user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = profile?.display_name
    || user?.user_metadata?.full_name
    || user?.email;

  return (
    <nav className="rounded-xl border border-gray-100 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-8 max-w-4xl mx-auto">
        <div className="w-[20%]">
          <Link to="/" className="text-base font-bold tracking-tight text-gray-900">
            Shop<span className="text-gray-400">Lit</span>
          </Link>
        </div>
        <ul className="flex list-none gap-7 mr-auto">
          <li>
            <NavLink to="/" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
            }>Home</NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
            }>Shop</NavLink>
          </li>
          <li>
            <NavLink to={'/browse' + (localStorage.getItem('lastPromotionsUrl') ?? '')} className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`
            }>Browse</NavLink>
          </li>
        </ul>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-white" />
              </div>
              <span className="hidden sm:block max-w-[140px] truncate font-medium">{displayName}</span>
              <ChevronDown size={13} className={`hidden sm:block transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowProfile(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={13} />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            )}

            {showProfile && (
              <ProfileModal
                user={user}
                profile={profile}
                onClose={() => setShowProfile(false)}
                onSave={(updated) => setProfile(updated)}
              />
            )}
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
