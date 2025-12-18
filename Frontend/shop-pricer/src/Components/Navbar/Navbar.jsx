import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar(){
    return (
        <nav className="px-4 py-2 bg-blue-400 w-full my-3 rounded-md">
            <div className="mx-2 flex">
                <Link to="/" className="mr-6">Shop-Pricer</Link>
                <ul className="flex gap-3">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/search">Search</Link>
                    </li>
                </ul>
                <ul className="ml-auto flex">
                    <li>
                        <Link to="/login">login</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}