import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createSignalement, getSignalements } from "../api/signalements";
import { getContainers } from "../api/containers";

const TYPE_OPTIONS = [
  "Conteneur plein",
  "Conteneur endommagé",
  "Dépôt sauvage",
  "Accès bloqué",
  "Autre anomalie",
];

const STATUT_LABEL = {
  OUVERT: "Envoyé",
  EN_COURS: "En traitement",
  RESOLU: "Résolu",
};

function CitizenReport() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: TYPE_OPTIONS[0],
    container_id: "",
    description: "",
  });
  const [containers, setContainers] = useState([]);
  const [lastReports, setLastReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getContainers(),
      user?.id ? getSignalements({ user_id: user.id }) : Promise.resolve([]),
    ])
      .then(([ctrs, reports]) => {
        setContainers(Array.isArray(ctrs) ? ctrs : (ctrs?.data ?? []));
        setLastReports(Array.isArray(reports) ? reports.slice(0, 5) : (reports?.data ?? []).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.container_id) {
      showToast("Veuillez sélectionner un conteneur concerné.", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Veuillez renseigner une description.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const newReport = await createSignalement({
        user_id: user.id,
        container_id: formData.container_id,
        type_incident: formData.type,
        description: formData.description,
        statut: "OUVERT",
      });

      setLastReports((prev) => [newReport, ...prev].slice(0, 5));
      setFormData({ type: TYPE_OPTIONS[0], container_id: "", description: "" });
      showToast("Votre signalement a bien été envoyé.", "success");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Erreur lors de l'envoi.", "error");
    } finally {
      setSubmitting(false);
    }
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
            Votre déclaration sera transmise aux services concernés afin d'être
            analysée et traitée.
          </p>

          <form onSubmit={handleSubmit} className="citizen-form">
            <div className="form-group">
              <label>Type de problème</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Conteneur concerné</label>
              <select
                name="container_id"
                value={formData.container_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner un conteneur --</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.type} {c.zone_id ? `(zone ${c.zone_id})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="6"
                placeholder="Décrivez le problème constaté..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Envoi en cours…" : "Envoyer le signalement"}
            </button>
          </form>
        </section>

        <section className="citizen-info-card">
          <h2>Comment ça marche ?</h2>

          <div className="citizen-steps">
            <div>
              <strong>1. Vous signalez</strong>
              <span>Vous indiquez le type de problème et le conteneur concerné.</span>
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
              <strong>4. Vous suivez l'évolution</strong>
              <span>Le statut du signalement peut être consulté dans l'historique.</span>
            </div>
          </div>
        </section>
      </div>

      <div className="panel-pro">
        <h2 className="section-title">Mes derniers signalements</h2>

        {loading ? (
          <p>Chargement…</p>
        ) : lastReports.length === 0 ? (
          <p>Aucun signalement pour le moment.</p>
        ) : (
          <div className="citizen-last-reports">
            {lastReports.map((report) => (
              <article className="citizen-last-report" key={report.id}>
                <div>
                  <h3>{report.type_incident}</h3>
                  <p>{report.description}</p>
                </div>

                <div className="citizen-last-report-meta">
                  <span>{new Date(report.created_at).toLocaleDateString("fr-FR")}</span>
                  <strong>{STATUT_LABEL[report.statut] ?? report.statut}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CitizenReport;
