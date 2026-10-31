import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/home" className="brand">StudyAI</Link>
        <nav>
          {user && <span className="user-email">{user}</span>}
          {user && <Link to="/history">History</Link>}
          {user && <button className="link-button" onClick={logout}>Logout</button>}
        </nav>
      </header>
      {children}
    </div>
  );
}
