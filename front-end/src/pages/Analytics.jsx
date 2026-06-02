import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { getContainers, getRoutes, getReports } from "../api/fakeApi";

function Analytics() {
  const [data, setData] = useState({
    containers: [],
    routes: [],
    reports: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const containers = await getContainers();
      const routes = await getRoutes();
      const reports = await getReports();

      setData({ containers, routes, reports });
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const averageFill =
    data.containers.length === 0
      ? 0
      : Math.round(
          data.containers.reduce((sum, c) => sum + c.fillLevel, 0) /
            data.containers.length
        );

  const criticalContainers = data.containers.filter(
    (container) => container.fillLevel >= 90
  ).length;

  const completedRoutes = data.routes.filter(
    (route) => route.status === "Terminée"
  ).length;

  const resolvedReports = data.reports.filter(
    (report) => report.status === "Résolu"
  ).length;

  const chartBars = [
    { label: "Lun", value: 42 },
    { label: "Mar", value: 58 },
    { label: "Mer", value: 76 },
    { label: "Jeu", value: 64 },
    { label: "Ven", value: averageFill },
    { label: "Sam", value: 52 },
    { label: "Dim", value: 38 },
  ];

  return (
    <div className="analytics-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Analyse & performance</span>
          <h1>Analytics</h1>
          <p>
            Visualisez les indicateurs clés de la plateforme : remplissage,
            performance des tournées et résolution des signalements.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Remplissage moyen</span>
          <strong>{averageFill}%</strong>
        </div>

        <div className="overview-card danger">
          <span>Critiques</span>
          <strong>{criticalContainers}</strong>
        </div>

        <div className="overview-card success">
          <span>Tournées terminées</span>
          <strong>{completedRoutes}</strong>
        </div>

        <div className="overview-card warning">
          <span>Signalements résolus</span>
          <strong>{resolvedReports}</strong>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card large">
          <div className="analytics-card-header">
            <div>
              <h2>Évolution du remplissage</h2>
              <p>Moyenne simulée sur 7 jours</p>
            </div>
          </div>

          <div className="bar-chart">
            {chartBars.map((bar) => (
              <div className="bar-item" key={bar.label}>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${bar.value}%` }}
                  ></div>
                </div>
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-card">
          <h2>Répartition des statuts</h2>

          <div className="analytics-list">
            <div>
              <span>Normal</span>
              <strong>
                {
                  data.containers.filter((container) => container.fillLevel < 70)
                    .length
                }
              </strong>
            </div>

            <div>
              <span>Attention</span>
              <strong>
                {
                  data.containers.filter(
                    (container) =>
                      container.fillLevel >= 70 && container.fillLevel < 90
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Critique</span>
              <strong>{criticalContainers}</strong>
            </div>
          </div>
        </section>

        <section className="analytics-card">
          <h2>Performance collecte</h2>

          <div className="performance-box">
            <strong>-20%</strong>
            <span>Réduction estimée des tournées inutiles</span>
          </div>

          <p className="analytics-note">
            Indicateur simulé basé sur l’objectif fonctionnel du projet.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Analytics;