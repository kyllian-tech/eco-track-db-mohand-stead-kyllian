import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/fakeApi";

function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return <p>Chargement du dashboard...</p>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Suivi global de la gestion intelligente des déchets</p>
      </div>

      <div className="stats-grid-pro">
        <div className="stat-card green">
          <div className="stat-icon">🟢</div>
          <div>
            <h3>{stats.totalContainers}</h3>
            <p>Conteneurs connectés</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">🔴</div>
          <div>
            <h3>{stats.criticalContainers}</h3>
            <p>Conteneurs critiques</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🟠</div>
          <div>
            <h3>{stats.warningContainers}</h3>
            <p>En attention</p>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div>
            <h3>{stats.averageFillLevel}%</h3>
            <p>Remplissage moyen</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Activité récente</h2>

          <div className="activity-list-pro">
            <div className="activity-item-pro">
              <span className="dot green"></span>
              Statistiques mises à jour
              <small>temps réel simulé</small>
            </div>

            <div className="activity-item-pro">
              <span className="dot red"></span>
              {stats.criticalContainers} conteneur(s) critique(s)
              <small>priorité haute</small>
            </div>

            <div className="activity-item-pro">
              <span className="dot blue"></span>
              Taux moyen : {stats.averageFillLevel}%
              <small>analyse globale</small>
            </div>
          </div>
        </div>

        <div className="card highlight">
          <h2>Résumé rapide</h2>
          <p>
            Le système surveille en continu les conteneurs et optimise les
            tournées pour réduire les coûts et améliorer l’efficacité.
          </p>

          <button className="primary-btn">
            Voir les conteneurs
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;