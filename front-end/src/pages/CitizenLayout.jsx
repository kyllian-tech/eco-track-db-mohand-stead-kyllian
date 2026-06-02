import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function CitizenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/space/citizen" className="app-brand">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </NavLink>

        <nav className="app-nav">
          <NavLink to="/space/citizen" end>
            Accueil citoyen
          </NavLink>
          
          <NavLink to="/space/citizen/map">
            Carte citoyenne
          </NavLink>

          <NavLink to="/space/citizen/report">
            Déclarer un problème
          </NavLink>

          <NavLink to="/space/citizen/gamification">
            Gamification
          </NavLink>

          <NavLink to="/space/citizen/history">
            Historique personnel
          </NavLink>

          <NavLink to="/space/citizen/notifications">
            Notifications
          </NavLink>

          <NavLink to="/space/citizen/profile">
            Profil
          </NavLink>

          <NavLink to="/space/citizen/settings">
          Paramètres
          </NavLink>
        </nav>

        <div className="sidebar-card">
          <p>Espace citoyen</p>
          <strong>Participation & impact</strong>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="topbar-label">Espace citoyen</p>
            <h2>Engagement citoyen et signalements</h2>
          </div>

          <div className="topbar-user">
            <NavLink to="/space/citizen/profile" className="user-avatar">
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

export default CitizenLayout;