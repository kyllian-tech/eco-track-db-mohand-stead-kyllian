import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { getContainers } from "../api/fakeApi";

function CitizenMap() {
  const [containers, setContainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContainers = async () => {
      const data = await getContainers();
      setContainers(data);
      setLoading(false);
    };

    loadContainers();
  }, []);

  const getStatusClass = (fillLevel) => {
    if (fillLevel >= 90) return "critical";
    if (fillLevel >= 70) return "warning";
    return "normal";
  };

  const filteredContainers = containers.filter((container) => {
    const search = searchTerm.toLowerCase();

    return (
      container.name.toLowerCase().includes(search) ||
      container.location.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="citizen-map-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Carte citoyenne</span>
          <h1>Conteneurs proches</h1>
          <p>
            Recherchez un conteneur, consultez son état et signalez rapidement
            un problème depuis votre espace citoyen.
          </p>
        </div>

        <Link to="/space/citizen/report" className="primary-btn">
          Déclarer un problème
        </Link>
      </div>

      <div className="panel-pro">
        <div className="panel-toolbar">
          <div className="search-box-pro">
            <span className="search-label">Recherche</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou localisation..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="citizen-map-layout">
          <div className="citizen-map-panel">
            <div className="fake-map citizen">
              {filteredContainers.map((container, index) => (
                <div
                  key={container.id}
                  className={`map-marker ${getStatusClass(
                    container.fillLevel
                  )}`}
                  style={{
                    top: `${24 + index * 18}%`,
                    left: `${22 + index * 24}%`,
                  }}
                  title={`${container.name} - ${container.fillLevel}%`}
                >
                  {container.fillLevel}%
                </div>
              ))}

              <div className="map-zone zone-a">Centre-ville</div>
              <div className="map-zone zone-b">Quartier Nord</div>
              <div className="map-zone zone-c">Parc Sud</div>
            </div>
          </div>

          <div className="citizen-map-sidebar">
            <h2>Résultats</h2>

            {filteredContainers.length === 0 ? (
              <div className="empty-state-pro">
                <h3>Aucun conteneur trouvé</h3>
                <p>Essayez une autre localisation.</p>
              </div>
            ) : (
              <div className="citizen-map-list">
                {filteredContainers.map((container) => (
                  <article className="citizen-map-item" key={container.id}>
                    <div>
                      <h3>{container.name}</h3>
                      <p>{container.location}</p>
                    </div>

                    <span
                      className={`map-status ${getStatusClass(
                        container.fillLevel
                      )}`}
                    >
                      {container.fillLevel}%
                    </span>

                    <Link
                      to="/space/citizen/report"
                      className="secondary-btn citizen-map-action"
                    >
                      Signaler
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <div className="map-legend">
              <h3>Légende</h3>
              <p>
                <span className="legend-dot normal"></span> Niveau normal
              </p>
              <p>
                <span className="legend-dot warning"></span> À surveiller
              </p>
              <p>
                <span className="legend-dot critical"></span> Critique
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenMap;