function ContainerCard({ id, name, location, fillLevel, onDelete, onEdit }) {
  let colorClass = "green";
  let statusLabel = "Normal";
  let statusText = "Niveau stable";

  if (fillLevel >= 90) {
    colorClass = "red";
    statusLabel = "Critique";
    statusText = "Collecte urgente";
  } else if (fillLevel >= 70) {
    colorClass = "orange";
    statusLabel = "Attention";
    statusText = "À surveiller";
  }

  return (
    <article className={`container-card premium ${colorClass}`}>
      <div className="container-card-top">
        <div>
          <span className="container-id">ID #{id}</span>
          <h3>{name}</h3>
          <p>{location}</p>
        </div>

        <div className="card-actions">
          <button
            className="edit-btn"
            onClick={() => onEdit(id)}
            title="Modifier"
          >
            ✎
          </button>

          <button
            className="delete-btn"
            onClick={() => onDelete(id)}
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="container-status-row">
        <span className={`status-badge ${colorClass}`}>{statusLabel}</span>
        <span className="status-text">{statusText}</span>
      </div>

      <div className="fill-level-row">
        <div>
          <span className="fill-label">Remplissage</span>
          <strong>{fillLevel}%</strong>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${colorClass}`}
          style={{ width: `${fillLevel}%` }}
        />
      </div>
    </article>
  );
}

export default ContainerCard;