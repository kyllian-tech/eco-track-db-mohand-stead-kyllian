import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/space/manager" className="app-brand">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/space/manager" end>
            Dashboard
          </NavLink>

          <NavLink to="/space/manager/containers">
            Conteneurs
          </NavLink>

          <NavLink to="/space/manager/map">
            Carte
          </NavLink>

          <NavLink to="/space/manager/routes">
            Tournées
          </NavLink>

          <NavLink to="/space/manager/reports">
            Signalements
          </NavLink>

          <NavLink to="/space/manager/analytics">
            Analytics
          </NavLink>

          <NavLink to="/space/manager/exports">
            Exports
          </NavLink>

          <NavLink to="/space/manager/profile">
            Profil
          </NavLink>
        </nav>

        <div className="sidebar-card">
          <p>Espace gestionnaire</p>
          <strong>Supervision opérationnelle</strong>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-label">Espace gestionnaire</p>
            <h2>Gestion intelligente des déchets urbains</h2>
          </div>

          <div className="topbar-user">
            <NavLink to="/space/manager/profile" className="user-avatar">
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

export default ManagerLayout;