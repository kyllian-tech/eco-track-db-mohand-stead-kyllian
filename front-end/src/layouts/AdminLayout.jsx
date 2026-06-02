import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/space/admin" className="app-brand">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/space/admin" end>
            Dashboard admin
          </NavLink>

          <NavLink to="/space/admin/users">
            Utilisateurs
          </NavLink>

          <NavLink to="/space/admin/registration-requests">
            Demandes d’inscription
          </NavLink>

          <NavLink to="/space/admin/roles">
            Rôles & permissions
          </NavLink>

          <NavLink to="/space/admin/settings">
            Paramètres
          </NavLink>

          <NavLink to="/space/admin/notifications">
            Notifications
          </NavLink>

          <NavLink to="/space/admin/history">
            Historique
          </NavLink>

          <NavLink to="/space/admin/security">
            Supervision Cyber
          </NavLink>

          <NavLink to="/space/admin/profile">
            Profil
          </NavLink>
        </nav>

        <div className="sidebar-card">
          <p>Espace administrateur</p>
          <strong>Sécurité & gouvernance</strong>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-label">Espace administrateur</p>
            <h2>Administration, sécurité et configuration</h2>
          </div>

          <div className="topbar-user">
            <NavLink to="/space/admin/profile" className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
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

export default AdminLayout;