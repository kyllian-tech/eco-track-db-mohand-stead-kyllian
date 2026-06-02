import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Smart City • IoT • Data</span>

          <h1>Optimisez la gestion des déchets urbains avec ECOTRACK</h1>

          <p>
            Une plateforme intelligente pour suivre les conteneurs connectés,
            réduire les tournées inutiles et améliorer la performance
            environnementale des villes.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="primary-link">
              Accéder à la plateforme
            </Link>

            <Link to="/about" className="secondary-link">
              Découvrir le projet
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <h3>État réseau</h3>
          <div className="hero-stat">
            <span>Conteneurs connectés</span>
            <strong>2 000</strong>
          </div>
          <div className="hero-stat">
            <span>Réduction tournées</span>
            <strong>-20%</strong>
          </div>
          <div className="hero-stat">
            <span>Disponibilité</span>
            <strong>99.5%</strong>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Une solution complète pour la ville intelligente</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Capteurs IoT</h3>
            <p>Suivi du niveau de remplissage des conteneurs en temps réel.</p>
          </div>

          <div className="feature-card">
            <h3>Optimisation</h3>
            <p>Calcul de tournées plus efficaces pour réduire les coûts.</p>
          </div>

          <div className="feature-card">
            <h3>Analytics</h3>
            <p>Tableaux de bord, indicateurs et rapports décisionnels.</p>
          </div>

          <div className="feature-card">
            <h3>Sécurité</h3>
            <p>Infrastructure sécurisée, supervision et contrôle des accès.</p>
          </div>
        </div>
      </section>

      <section className="ad-section">
        <div>
          <h2>Espace partenaire</h2>
          <p>
            Zone dédiée aux partenaires, campagnes écologiques ou annonces
            institutionnelles.
          </p>
        </div>

        <div className="ad-banner">
          🌱 Publicité / Partenaire ECOTRACK
        </div>
      </section>
    </div>
  );
}

export default Landing;