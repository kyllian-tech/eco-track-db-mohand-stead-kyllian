import { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";

function Containers() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("fill-desc");

  const [containers, setContainers] = useState([
    {
      id: 1,
      name: "Conteneur Centre-ville",
      location: "Place Centrale",
      zone: "Centre-ville",
      capacity: "1200 L",
      fillLevel: 95,
      status: "Critique",
      lastUpdate: "Il y a 5 min",
      sensor: "Actif",
    },
    {
      id: 2,
      name: "Conteneur Quartier Nord",
      location: "Rue des Écoles",
      zone: "Quartier Nord",
      capacity: "1000 L",
      fillLevel: 72,
      status: "Attention",
      lastUpdate: "Il y a 12 min",
      sensor: "Actif",
    },
    {
      id: 3,
      name: "Conteneur Parc Sud",
      location: "Avenue Verte",
      zone: "Parc Sud",
      capacity: "900 L",
      fillLevel: 38,
      status: "Normal",
      lastUpdate: "Il y a 20 min",
      sensor: "Actif",
    },
    {
      id: 4,
      name: "Conteneur Châtelet",
      location: "Châtelet",
      zone: "Centre-ville",
      capacity: "1100 L",
      fillLevel: 70,
      status: "Attention",
      lastUpdate: "Il y a 25 min",
      sensor: "Actif",
    },
  ]);

  const [newContainer, setNewContainer] = useState({
    name: "",
    location: "",
    zone: "Centre-ville",
    capacity: "",
  });

  const getStatusFromFill = (fillLevel) => {
    if (fillLevel >= 90) return "Critique";
    if (fillLevel >= 70) return "Attention";
    return "Normal";
  };

  const getStatusClass = (status) => {
    if (status === "Critique") return "red";
    if (status === "Attention") return "orange";
    return "green";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewContainer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddContainer = (event) => {
    event.preventDefault();

    if (
      !newContainer.name.trim() ||
      !newContainer.location.trim() ||
      !newContainer.capacity.trim()
    ) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    const createdContainer = {
      id: Date.now(),
      name: newContainer.name,
      location: newContainer.location,
      zone: newContainer.zone,
      capacity: newContainer.capacity,
      fillLevel: 0,
      status: "Normal",
      lastUpdate: "À l’instant",
      sensor: "Actif",
    };

    setContainers((current) => [createdContainer, ...current]);

    setNewContainer({
      name: "",
      location: "",
      zone: "Centre-ville",
      capacity: "",
    });

    showToast("Conteneur ajouté avec succès.", "success");
  };

  const handleDelete = (id) => {
    setContainers((current) =>
      current.filter((container) => container.id !== id)
    );

    showToast("Conteneur supprimé.", "success");
  };

  const handleSimulateUpdate = (id) => {
    setContainers((current) =>
      current.map((container) => {
        if (container.id !== id) return container;

        const nextFillLevel = Math.min(container.fillLevel + 8, 100);

        return {
          ...container,
          fillLevel: nextFillLevel,
          status: getStatusFromFill(nextFillLevel),
          lastUpdate: "À l’instant",
        };
      })
    );

    showToast("Mesure IoT simulée.", "success");
  };

  const filteredContainers = useMemo(() => {
    const result = containers.filter((container) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        container.name.toLowerCase().includes(search) ||
        container.location.toLowerCase().includes(search) ||
        container.zone.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "Tous" || container.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "fill-desc") return b.fillLevel - a.fillLevel;
      if (sortBy === "fill-asc") return a.fillLevel - b.fillLevel;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [containers, searchTerm, statusFilter, sortBy]);

  const criticalCount = containers.filter(
    (container) => container.status === "Critique"
  ).length;

  const attentionCount = containers.filter(
    (container) => container.status === "Attention"
  ).length;

  const averageFill = Math.round(
    containers.reduce((sum, container) => sum + container.fillLevel, 0) /
      containers.length
  );

  return (
    <div className="containers-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Supervision IoT</span>
          <h1>Conteneurs</h1>
          <p>
            Gérez les conteneurs connectés, surveillez les niveaux de
            remplissage et identifiez les priorités de collecte.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total conteneurs</span>
          <strong>{containers.length}</strong>
        </div>

        <div className="overview-card danger">
          <span>Critiques</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>En attention</span>
          <strong>{attentionCount}</strong>
        </div>

        <div className="overview-card success">
          <span>Remplissage moyen</span>
          <strong>{averageFill}%</strong>
        </div>
      </div>

      <section className="panel-pro">
        <h2 className="section-title">Ajouter un conteneur</h2>

        <form className="manager-container-form" onSubmit={handleAddContainer}>
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="name"
              placeholder="Ex : Conteneur Gare"
              value={newContainer.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Localisation</label>
            <input
              type="text"
              name="location"
              placeholder="Ex : Avenue Centrale"
              value={newContainer.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Zone</label>
            <select
              name="zone"
              value={newContainer.zone}
              onChange={handleChange}
            >
              <option>Centre-ville</option>
              <option>Quartier Nord</option>
              <option>Parc Sud</option>
              <option>Avenue Verte</option>
            </select>
          </div>

          <div className="form-group">
            <label>Capacité</label>
            <input
              type="text"
              name="capacity"
              placeholder="Ex : 1000 L"
              value={newContainer.capacity}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="primary-btn">
            Ajouter
          </button>
        </form>
      </section>

      <section className="panel-pro">
        <div className="panel-toolbar">
          <div className="search-box-pro">
            <span className="search-label">Recherche</span>
            <input
              type="text"
              placeholder="Nom, localisation ou zone..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="select-pro"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="fill-desc">Remplissage décroissant</option>
            <option value="fill-asc">Remplissage croissant</option>
            <option value="name">Nom</option>
          </select>
        </div>

        <div className="filters-pro">
          {["Tous", "Critique", "Attention", "Normal"].map((status) => (
            <button
              type="button"
              key={status}
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredContainers.length === 0 ? (
          <div className="empty-state-pro">
            <h3>Aucun conteneur trouvé</h3>
            <p>Modifiez votre recherche ou vos filtres.</p>
          </div>
        ) : (
          <div className="containers-grid-pro">
            {filteredContainers.map((container) => (
              <article className="container-card" key={container.id}>
                <div className="card-header">
                  <div>
                    <h3>{container.name}</h3>
                    <p>{container.location}</p>
                  </div>

                  <div className="card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleSimulateUpdate(container.id)}
                      title="Simuler une mesure IoT"
                    >
                      +
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(container.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <span
                  className={`status-badge ${getStatusClass(
                    container.status
                  )}`}
                >
                  {container.status}
                </span>

                <div className="container-meta-grid">
                  <div>
                    <span>Zone</span>
                    <strong>{container.zone}</strong>
                  </div>

                  <div>
                    <span>Capacité</span>
                    <strong>{container.capacity}</strong>
                  </div>

                  <div>
                    <span>Capteur</span>
                    <strong>{container.sensor}</strong>
                  </div>

                  <div>
                    <span>Mise à jour</span>
                    <strong>{container.lastUpdate}</strong>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Remplissage</span>
                    <strong>{container.fillLevel}%</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getStatusClass(
                        container.status
                      )}`}
                      style={{ width: `${container.fillLevel}%` }}
                    ></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Containers;