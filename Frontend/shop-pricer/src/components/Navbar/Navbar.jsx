import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
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
        </ul>
        <NavLink
          to="/login"
          className={({ isActive }) =>
                `rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${isActive?"":"hover:border-gray-900 hover:text-gray-900"} ${isActive? "text-white bg-black border-black" :"border-gray-300 text-gray-700"} `
            }
        >
          Get Started
        </NavLink>
      </div>
    </nav>
  );
}