import { useState } from "react";
import { useToast } from "../context/ToastContext";

function CitizenReport() {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: "Conteneur plein",
    location: "",
    description: "",
  });

  const [lastReports, setLastReports] = useState([
    {
      id: 1,
      type: "Conteneur plein",
      location: "Place Centrale",
      status: "Envoyé",
      date: "Aujourd’hui",
    },
    {
      id: 2,
      type: "Dépôt sauvage",
      location: "Avenue Verte",
      status: "En cours d’analyse",
      date: "Hier",
    },
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.location.trim() || !formData.description.trim()) {
      showToast("Veuillez renseigner la localisation et la description.", "error");
      return;
    }

    const newReport = {
      id: Date.now(),
      type: formData.type,
      location: formData.location,
      status: "Envoyé",
      date: "À l’instant",
    };

    setLastReports((current) => [newReport, ...current]);

    setFormData({
      type: "Conteneur plein",
      location: "",
      description: "",
    });

    showToast("Votre signalement a bien été envoyé.", "success");
  };

  return (
    <div className="citizen-report-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Espace citoyen</span>
          <h1>Déclarer un problème</h1>
          <p>
            Signalez rapidement un conteneur plein, un dépôt sauvage ou une
            anomalie constatée dans votre quartier.
          </p>
        </div>
      </div>

      <div className="citizen-layout">
        <section className="citizen-form-card">
          <h2>Nouveau signalement</h2>
          <p>
            Votre déclaration sera transmise aux services concernés afin d’être
            analysée et traitée.
          </p>

          <form onSubmit={handleSubmit} className="citizen-form">
            <div className="form-group">
              <label>Type de problème</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option>Conteneur plein</option>
                <option>Conteneur endommagé</option>
                <option>Dépôt sauvage</option>
                <option>Accès bloqué</option>
                <option>Autre anomalie</option>
              </select>
            </div>

            <div className="form-group">
              <label>Localisation</label>
              <input
                type="text"
                name="location"
                placeholder="Ex : Place Centrale"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="6"
                placeholder="Décrivez le problème constaté..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="primary-btn">
              Envoyer le signalement
            </button>
          </form>
        </section>

        <section className="citizen-info-card">
          <h2>Comment ça marche ?</h2>

          <div className="citizen-steps">
            <div>
              <strong>1. Vous signalez</strong>
              <span>Vous indiquez le type de problème et sa localisation.</span>
            </div>

            <div>
              <strong>2. Le signalement est transmis</strong>
              <span>Les services concernés reçoivent votre déclaration.</span>
            </div>

            <div>
              <strong>3. Une intervention peut être planifiée</strong>
              <span>Un agent peut être affecté si une action terrain est nécessaire.</span>
            </div>

            <div>
              <strong>4. Vous suivez l’évolution</strong>
              <span>Le statut du signalement peut être consulté ensuite.</span>
            </div>
          </div>
        </section>
      </div>

      <div className="panel-pro">
        <h2 className="section-title">Mes derniers signalements</h2>

        <div className="citizen-last-reports">
          {lastReports.map((report) => (
            <article className="citizen-last-report" key={report.id}>
              <div>
                <h3>{report.type}</h3>
                <p>{report.location}</p>
              </div>

              <div className="citizen-last-report-meta">
                <span>{report.date}</span>
                <strong>{report.status}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CitizenReport;