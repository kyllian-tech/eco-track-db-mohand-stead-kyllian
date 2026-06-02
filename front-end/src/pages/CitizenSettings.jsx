import { useState } from "react";
import { useToast } from "../context/ToastContext";

function CitizenSettings() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    neighborhood: "Centre-ville",
    emailNotifications: true,
    challengeNotifications: true,
    reportUpdates: true,
    profileVisibility: "Privé",
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    showToast("Préférences citoyennes enregistrées.", "success");
  };

  return (
    <div className="citizen-settings-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Préférences citoyennes</span>
          <h1>Paramètres citoyen</h1>
          <p>
            Gérez vos préférences de notification, votre quartier de référence
            et la confidentialité de votre espace citoyen.
          </p>
        </div>
      </div>

      <div className="citizen-settings-grid">
        <section className="citizen-settings-card">
          <h2>Préférences générales</h2>

          <form onSubmit={handleSubmit} className="citizen-settings-form">
            <div className="form-group">
              <label>Quartier / zone principale</label>
              <select
                name="neighborhood"
                value={settings.neighborhood}
                onChange={handleChange}
              >
                <option>Centre-ville</option>
                <option>Quartier Nord</option>
                <option>Parc Sud</option>
                <option>Avenue Verte</option>
              </select>
            </div>

            <div className="form-group">
              <label>Visibilité du profil</label>
              <select
                name="profileVisibility"
                value={settings.profileVisibility}
                onChange={handleChange}
              >
                <option>Privé</option>
                <option>Visible dans le classement</option>
              </select>
            </div>

            <button type="submit" className="primary-btn">
              Enregistrer les préférences
            </button>
          </form>
        </section>

        <section className="citizen-settings-card">
          <h2>Notifications</h2>

          <div className="citizen-toggle-list">
            <label className="citizen-toggle-row">
              <div>
                <strong>Notifications email</strong>
                <span>Recevoir les informations importantes par email.</span>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
            </label>

            <label className="citizen-toggle-row">
              <div>
                <strong>Suivi des signalements</strong>
                <span>Être informé lorsqu’un signalement change de statut.</span>
              </div>
              <input
                type="checkbox"
                name="reportUpdates"
                checked={settings.reportUpdates}
                onChange={handleChange}
              />
            </label>

            <label className="citizen-toggle-row">
              <div>
                <strong>Défis citoyens</strong>
                <span>Recevoir les nouveaux défis et récompenses disponibles.</span>
              </div>
              <input
                type="checkbox"
                name="challengeNotifications"
                checked={settings.challengeNotifications}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CitizenSettings;