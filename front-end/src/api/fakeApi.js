// Simule un délai réseau
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   📦 CONTENEURS (persistants)
========================= */

// Utilise localStorage pour simuler une base de données
let containersDB = JSON.parse(localStorage.getItem("containers")) || [
  {
    id: 1,
    name: "Conteneur Centre-ville",
    location: "Place Centrale",
    fillLevel: 95,
  },
  {
    id: 2,
    name: "Conteneur Quartier Nord",
    location: "Rue des Écoles",
    fillLevel: 72,
  },
  {
    id: 3,
    name: "Conteneur Parc Sud",
    location: "Avenue Verte",
    fillLevel: 38,
  },
];

// Sauvegarde dans localStorage
const save = () => {
  localStorage.setItem("containers", JSON.stringify(containersDB));
};

// 📥 GET
export const getContainers = async () => {
  await delay(300);
  return [...containersDB];
};

// ➕ CREATE
export const createContainer = async (newContainer) => {
  await delay(300);

  const container = {
    id: Date.now(),
    ...newContainer,
  };

  containersDB.push(container);
  save();

  return container;
};

// ✏️ UPDATE
export const updateContainer = async (id, updatedData) => {
  await delay(300);

  containersDB = containersDB.map((c) =>
    c.id === id ? { ...c, ...updatedData } : c
  );

  save();
};

// ❌ DELETE
export const deleteContainer = async (id) => {
  await delay(300);

  containersDB = containersDB.filter((c) => c.id !== id);
  save();
};

/* =========================
   🚛 TOURNÉES
========================= */
export const getRoutes = async () => {
  await delay(500);

  return [
    {
      id: 1,
      name: "Tournée Centre-ville",
      agent: "Agent A",
      containers: 18,
      distance: "12.4 km",
      duration: "1h45",
      status: "En cours",
    },
    {
      id: 2,
      name: "Tournée Quartier Nord",
      agent: "Agent B",
      containers: 24,
      distance: "18.7 km",
      duration: "2h10",
      status: "Planifiée",
    },
    {
      id: 3,
      name: "Tournée Parc Sud",
      agent: "Agent C",
      containers: 12,
      distance: "8.9 km",
      duration: "1h05",
      status: "Terminée",
    },
  ];
};

/* =========================
   🚨 SIGNALEMENTS
========================= */
export const getReports = async () => {
  await delay(500);

  return [
    {
      id: 1,
      title: "Conteneur plein",
      location: "Place Centrale",
      author: "Citoyen",
      status: "Nouveau",
    },
    {
      id: 2,
      title: "Conteneur endommagé",
      location: "Rue des Écoles",
      author: "Agent A",
      status: "En traitement",
    },
    {
      id: 3,
      title: "Dépôt sauvage",
      location: "Avenue Verte",
      author: "Citoyen",
      status: "Résolu",
    },
  ];
};

/* =========================
   📊 DASHBOARD
========================= */
export const getDashboardStats = async () => {
  await delay(300);

  const containers = await getContainers();

  const totalContainers = containers.length;
  const criticalContainers = containers.filter((c) => c.fillLevel >= 90).length;
  const warningContainers = containers.filter(
    (c) => c.fillLevel >= 70 && c.fillLevel < 90
  ).length;

  const averageFillLevel =
    totalContainers === 0
      ? 0
      : Math.round(
          containers.reduce((sum, c) => sum + c.fillLevel, 0) /
            totalContainers
        );

  return {
    totalContainers,
    criticalContainers,
    warningContainers,
    averageFillLevel,
  };
};