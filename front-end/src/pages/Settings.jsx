import { useState } from "react";
import { useToast } from "../context/ToastContext";

function Settings() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    language: "Français",
    timezone: "Europe/Paris",
    theme: "Clair",
    secureSession: true,
    mockAuth: true,
  });

  const [alertSettings, setAlertSettings] = useState({
    standardThreshold: 80,
    publicAreaThreshold: 85,
    denseAreaThreshold: 90,
    glassThreshold: 75,
    organicThreshold: 70,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    recipients: "gestionnaire@ecotrack.com, admin@ecotrack.com",
  });

  const writeAuditLog = (action) => {
    const previousLogs = JSON.parse(
      localStorage.getItem("ecotrack_audit_logs") || "[]"
    );

    const newLog = {
      id: Date.now(),
      action,
      module: "Paramètres",
      actor: "Administrateur",
      date: new Date().toLocaleString("fr-FR"),
    };

    localStorage.setItem(
      "ecotrack_audit_logs",
      JSON.stringify([newLog, ...previousLogs])
    );
  };

  const handleGeneralChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAlertChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAlertSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveGeneral = () => {
    localStorage.setItem("ecotrack_admin_settings", JSON.stringify(settings));
    writeAuditLog("Mise à jour des paramètres généraux");
    showToast("Paramètres généraux sauvegardés.", "success");
  };

  const handleSaveAlerts = () => {
    localStorage.setItem(
      "ecotrack_alert_settings",
      JSON.stringify(alertSettings)
    );

    writeAuditLog("Configuration des alertes mise à jour");
    showToast("Configuration des alertes sauvegardée.", "success");
  };

  const activeChannels = [
    alertSettings.emailEnabled ? "Email" : null,
    alertSettings.smsEnabled ? "SMS" : null,
    alertSettings.pushEnabled ? "Push" : null,
  ].filter(Boolean);

  return (
    <div className="settings-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Configuration</span>
          <h1>Paramètres</h1>
          <p>
            Gérez les préférences, les seuils d’alertes, les destinataires de
            notification et les options de sécurité.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Canaux actifs</span>
          <strong>{activeChannels.length}</strong>
        </div>

        <div className="overview-card success">
          <span>Email</span>
          <strong>{alertSettings.emailEnabled ? "Actif" : "Off"}</strong>
        </div>

        <div className="overview-card warning">
          <span>SMS</span>
          <strong>{alertSettings.smsEnabled ? "Actif" : "Off"}</strong>
        </div>

        <div className="overview-card">
          <span>Push</span>
          <strong>{alertSettings.pushEnabled ? "Actif" : "Off"}</strong>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Préférences générales</h2>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSaveGeneral}
            >
              Sauvegarder
            </button>
          </div>

          <div className="settings-list">
            <label className="settings-row">
              <div>
                <strong>Langue</strong>
                <span>Langue utilisée dans l’interface</span>
              </div>

              <select
                name="language"
                value={settings.language}
                onChange={handleGeneralChange}
              >
                <option>Français</option>
                <option>Anglais</option>
              </select>
            </label>

            <label className="settings-row">
              <div>
                <strong>Fuseau horaire</strong>
                <span>Utilisé pour les tournées et signalements</span>
              </div>

              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleGeneralChange}
              >
                <option>Europe/Paris</option>
                <option>Africa/Kinshasa</option>
                <option>Africa/Brazzaville</option>
              </select>
            </label>

            <label className="settings-row">
              <div>
                <strong>Thème</strong>
                <span>Mode d’affichage de l’interface</span>
              </div>

              <select
                name="theme"
                value={settings.theme}
                onChange={handleGeneralChange}
              >
                <option>Clair</option>
                <option>Sombre</option>
              </select>
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Sécurité</h2>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSaveGeneral}
            >
              Sauvegarder
            </button>
          </div>

          <div className="settings-list">
            <label className="settings-row">
              <div>
                <strong>Session sécurisée</strong>
                <span>Protection de l’espace connecté</span>
              </div>

              <input
                type="checkbox"
                name="secureSession"
                checked={settings.secureSession}
                onChange={handleGeneralChange}
              />
            </label>

            <label className="settings-row">
              <div>
                <strong>Authentification simulée</strong>
                <span>Mode front-end avec confirmation email</span>
              </div>

              <input
                type="checkbox"
                name="mockAuth"
                checked={settings.mockAuth}
                onChange={handleGeneralChange}
              />
            </label>
          </div>
        </section>
      </div>

      <section className="settings-card alert-settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Configuration des alertes</h2>
            <p>
              Définissez les seuils par type de conteneur, les destinataires et
              les canaux de notification.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={handleSaveAlerts}
          >
            Enregistrer les alertes
          </button>
        </div>

        <div className="alert-settings-layout">
          <div className="alert-thresholds">
            <h3>Seuils d’alerte</h3>

            <label className="threshold-row">
              <span>Conteneur standard</span>
              <input
                type="number"
                name="standardThreshold"
                min="1"
                max="100"
                value={alertSettings.standardThreshold}
                onChange={handleAlertChange}
              />
              <strong>%</strong>
            </label>

            <label className="threshold-row">
              <span>Zone publique</span>
              <input
                type="number"
                name="publicAreaThreshold"
                min="1"
                max="100"
                value={alertSettings.publicAreaThreshold}
                onChange={handleAlertChange}
              />
              <strong>%</strong>
            </label>

            <label className="threshold-row">
              <span>Zone dense</span>
              <input
                type="number"
                name="denseAreaThreshold"
                min="1"
                max="100"
                value={alertSettings.denseAreaThreshold}
                onChange={handleAlertChange}
              />
              <strong>%</strong>
            </label>

            <label className="threshold-row">
              <span>Verre</span>
              <input
                type="number"
                name="glassThreshold"
                min="1"
                max="100"
                value={alertSettings.glassThreshold}
                onChange={handleAlertChange}
              />
              <strong>%</strong>
            </label>

            <label className="threshold-row">
              <span>Organique</span>
              <input
                type="number"
                name="organicThreshold"
                min="1"
                max="100"
                value={alertSettings.organicThreshold}
                onChange={handleAlertChange}
              />
              <strong>%</strong>
            </label>
          </div>

          <div className="alert-channels">
            <h3>Canaux de notification</h3>

            <label className="channel-row">
              <div>
                <strong>Email</strong>
                <span>Envoyer les alertes par email</span>
              </div>

              <input
                type="checkbox"
                name="emailEnabled"
                checked={alertSettings.emailEnabled}
                onChange={handleAlertChange}
              />
            </label>

            <label className="channel-row">
              <div>
                <strong>SMS</strong>
                <span>Envoyer les alertes critiques par SMS</span>
              </div>

              <input
                type="checkbox"
                name="smsEnabled"
                checked={alertSettings.smsEnabled}
                onChange={handleAlertChange}
              />
            </label>

            <label className="channel-row">
              <div>
                <strong>Push</strong>
                <span>Notifier les utilisateurs connectés</span>
              </div>

              <input
                type="checkbox"
                name="pushEnabled"
                checked={alertSettings.pushEnabled}
                onChange={handleAlertChange}
              />
            </label>

            <div className="form-group recipients-field">
              <label>Destinataires</label>
              <textarea
                name="recipients"
                rows="5"
                value={alertSettings.recipients}
                onChange={handleAlertChange}
                placeholder="Ex : admin@ecotrack.com, gestionnaire@ecotrack.com"
              ></textarea>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;