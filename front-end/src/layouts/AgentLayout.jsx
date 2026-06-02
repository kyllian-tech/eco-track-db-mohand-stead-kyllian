import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function AgentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/space/agent" className="app-brand">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/space/agent" end>
            Accueil agent
          </NavLink>

          <NavLink to="/space/agent/routes">
            Tournée du jour
          </NavLink>

          <NavLink to="/space/agent/map">
            Carte terrain
          </NavLink>

          <NavLink to="/space/agent/reports">
            Anomalies terrain
          </NavLink>

          <NavLink to="/space/agent/profile">
            Profil
          </NavLink>
        </nav>

        <div className="sidebar-card">
          <p>Espace agent</p>
          <strong>Collecte & terrain</strong>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-label">Espace agent</p>
            <h2>Tournées, collectes et anomalies terrain</h2>
          </div>

          <div className="topbar-user">
            <NavLink to="/space/agent/profile" className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </NavLink>

            <div className="user-details">
              <strong>{user?.name}</strong>
              <span>{user?.roleLabel}</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;