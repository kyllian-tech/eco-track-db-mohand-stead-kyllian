import { useState } from "react";
import { getContainers } from "../api/containers";
import { getSignalements } from "../api/signalements";
import { getRoutes } from "../api/routes";
import { getMeasurements } from "../api/measurements";
import { useToast } from "../context/ToastContext";

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  return lines.join("\n");
}

function downloadCSV(filename, csv) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPORTS = [
  {
    key: "containers",
    title: "Conteneurs",
    description: "Tous les conteneurs IoT : type, capacité, zone, dernière maintenance.",
    filename: () => `ecotrack_conteneurs_${new Date().toISOString().slice(0, 10)}.csv`,
    fetch: () => getContainers(),
    transform: (rows) =>
      rows.map(({ id, code, type, capacite_litres, zone_id, derniere_maintenance, created_at }) => ({
        id, code, type, capacite_litres, zone_id,
        derniere_maintenance: derniere_maintenance ?? "",
        created_at,
      })),
  },
  {
    key: "signalements",
    title: "Signalements citoyens",
    description: "Historique complet des signalements avec statut et description.",
    filename: () => `ecotrack_signalements_${new Date().toISOString().slice(0, 10)}.csv`,
    fetch: () => getSignalements(),
    transform: (rows) =>
      rows.map(({ id, statut, description, container_id, user_id, created_at, updated_at }) => ({
        id, statut, description: description ?? "", container_id: container_id ?? "",
        user_id: user_id ?? "", created_at, updated_at: updated_at ?? "",
      })),
  },
  {
    key: "routes",
    title: "Tournées",
    description: "Toutes les tournées avec statut, agent assigné et dates.",
    filename: () => `ecotrack_tournees_${new Date().toISOString().slice(0, 10)}.csv`,
    fetch: () => getRoutes(),
    transform: (rows) =>
      rows.map(({ id, statut, agent_id, date_planifiee, date_debut, date_fin, created_at }) => ({
        id, statut,
        agent_id: agent_id ?? "",
        date_planifiee: date_planifiee ?? "",
        date_debut: date_debut ?? "",
        date_fin: date_fin ?? "",
        created_at,
      })),
  },
  {
    key: "measurements",
    title: "Mesures IoT",
    description: "Historique des relevés capteurs : taux de remplissage, température, batterie.",
    filename: () => `ecotrack_mesures_${new Date().toISOString().slice(0, 10)}.csv`,
    fetch: () => getMeasurements({ limit: 1000 }),
    transform: (rows) =>
      rows.map(({ id, container_id, taux_remplissage, temperature, batterie_niveau, timestamp }) => ({
        id, container_id, taux_remplissage,
        temperature: temperature ?? "",
        batterie_niveau: batterie_niveau ?? "",
        timestamp,
      })),
  },
];

function ExportCard({ config }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const raw = await config.fetch();
      const rows = config.transform(Array.isArray(raw) ? raw : []);
      if (!rows.length) {
        showToast("Aucune donnée à exporter.", "error");
        return;
      }
      const csv = toCSV(rows);
      downloadCSV(config.filename(), csv);
      setCount(rows.length);
      showToast(`${rows.length} ligne(s) exportée(s).`, "success");
    } catch {
      showToast("Erreur lors de l'export.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="export-card-pro">
      <div className="export-header">
        <div>
          <span className="export-format">CSV</span>
          <h3>{config.title}</h3>
        </div>
        <span className="export-status available">Disponible</span>
      </div>

      <p>{config.description}</p>

      <div className="export-meta">
        <span>Format</span>
        <strong>CSV UTF-8 (Excel compatible)</strong>
      </div>

      {count !== null && (
        <div className="export-meta">
          <span>Dernier export</span>
          <strong>{count} lignes</strong>
        </div>
      )}

      <button
        className="btn-primary export-btn"
        onClick={handleExport}
        disabled={loading}
        style={{ marginTop: "0.75rem", width: "100%" }}
      >
        {loading ? "Chargement…" : "Télécharger CSV"}
      </button>
    </article>
  );
}

function Exports() {
  return (
    <div className="exports-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Rapports & exports</span>
          <h1>Exports</h1>
          <p>
            Téléchargez les données réelles de la plateforme en CSV, directement
            depuis la base de données.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card success">
          <span>Exports disponibles</span>
          <strong>{EXPORTS.length}</strong>
        </div>
        <div className="overview-card">
          <span>Format</span>
          <strong>CSV</strong>
        </div>
        <div className="overview-card">
          <span>Encodage</span>
          <strong>UTF-8 BOM</strong>
        </div>
        <div className="overview-card">
          <span>Compatible</span>
          <strong>Excel / Sheets</strong>
        </div>
      </div>

      <div className="panel-pro">
        <div className="exports-grid">
          {EXPORTS.map((config) => (
            <ExportCard key={config.key} config={config} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Exports;
