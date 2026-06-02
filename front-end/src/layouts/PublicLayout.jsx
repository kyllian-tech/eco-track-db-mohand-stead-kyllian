import { Link, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="public-logo">
          <img src={logo} alt="ECOTRACK" className="logo-img" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-btn">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="public-content">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-left">
          <img src={logo} alt="ECOTRACK" className="footer-logo" />
          <p>Plateforme intelligente de gestion des déchets urbains.</p>
        </div>

        <div className="footer-links">
          <h4>Liens</h4>
          <Link to="/">Accueil</Link>
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-socials">
          <h4>Réseaux</h4>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
          <a href="#">Facebook</a>
        </div>

        <div className="footer-ads">
          <h4>Partenaires</h4>
          <div className="ad-box">🌱 Votre publicité ici</div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;