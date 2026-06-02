function ContainerModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
  editingId,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{editingId ? "Modifier le conteneur" : "Ajouter un conteneur"}</h2>

          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              value={formData.name}
              placeholder="Ex: Conteneur Gare"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Localisation</label>
            <input
              type="text"
              value={formData.location}
              placeholder="Ex: Avenue de la Gare"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Niveau de remplissage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.fillLevel}
              placeholder="Ex: 65"
              onChange={(e) =>
                setFormData({ ...formData, fillLevel: e.target.value })
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Annuler
            </button>

            <button type="submit" className="primary-btn">
              {editingId ? "Modifier" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContainerModal;