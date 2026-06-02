import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { getContainers } from "../api/fakeApi";

function MapView() {
  const [containers, setContainers] = useState([]);
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="map-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Vue géographique</span>
          <h1>Carte des conteneurs</h1>
          <p>
            Visualisation des conteneurs connectés par zone, avec leur niveau de
            remplissage et leur état opérationnel.
          </p>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-panel">
          <div className="fake-map">
            {containers.map((container, index) => (
              <div
                key={container.id}
                className={`map-marker ${getStatusClass(container.fillLevel)}`}
                style={{
                  top: `${25 + index * 18}%`,
                  left: `${25 + index * 22}%`,
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

        <div className="map-sidebar">
          <h2>Conteneurs suivis</h2>

          <div className="map-list">
            {containers.map((container) => (
              <div className="map-list-item" key={container.id}>
                <div>
                  <h3>{container.name}</h3>
                  <p>{container.location}</p>
                </div>

                <span className={`map-status ${getStatusClass(container.fillLevel)}`}>
                  {container.fillLevel}%
                </span>
              </div>
            ))}
          </div>

          <div className="map-legend">
            <h3>Légende</h3>
            <p>
              <span className="legend-dot normal"></span> Normal
            </p>
            <p>
              <span className="legend-dot warning"></span> Attention
            </p>
            <p>
              <span className="legend-dot critical"></span> Critique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;