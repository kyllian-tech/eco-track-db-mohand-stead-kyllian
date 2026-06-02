import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/app" className="app-brand">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/app" end>
            Dashboard
          </NavLink>

          <NavLink to="/app/citizen-space">Espace Citoyen</NavLink>
          <NavLink to="/app/agent-space">Espace Agent</NavLink>
          <NavLink to="/app/manager-space">Espace Gestionnaire</NavLink>
          <NavLink to="/app/admin-space">Espace Administrateur</NavLink>

          <NavLink to="/app/profile">Profil</NavLink>
          <NavLink to="/app/settings">Paramètres</NavLink>
          <NavLink to="/app/notifications">Notifications</NavLink>
          <NavLink to="/app/users">Utilisateurs</NavLink>
          <NavLink to="/app/history">Historique</NavLink>
          <NavLink to="/app/exports">Exports</NavLink>
          <NavLink to="/app/citizen-report">Signalement citoyen</NavLink>
          <NavLink to="/app/gamification">Gamification</NavLink>
          <NavLink to="/app/security">Supervision Cyber</NavLink>

          <NavLink to="/app/containers">Conteneurs</NavLink>
          <NavLink to="/app/map">Carte</NavLink>
          <NavLink to="/app/routes">Tournées</NavLink>
          <NavLink to="/app/reports">Signalements</NavLink>
          <NavLink to="/app/analytics">Analytics</NavLink>
        </nav>

        <div className="sidebar-card">
          <p>Plateforme intelligente</p>
          <strong>Smart Waste Monitoring</strong>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-label">Espace connecté</p>
            <h2>Gestion intelligente des déchets urbains</h2>
          </div>

          <div className="topbar-user">
            <NavLink to="/app/profile" className="user-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </NavLink>

            <div className="user-details">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
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

export default DashboardLayout;