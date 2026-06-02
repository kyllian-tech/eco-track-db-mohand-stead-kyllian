import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ContainerChart({ stats }) {
  const data = [
    { name: "Critique", value: stats.criticalContainers },
    { name: "Attention", value: stats.warningContainers },
    {
      name: "Normal",
      value:
        stats.totalContainers -
        stats.criticalContainers -
        stats.warningContainers,
    },
  ];

  const COLORS = ["#dc2626", "#f59e0b", "#16a34a"];

  return (
    <div className="chart-card">
      <h3>Répartition des conteneurs</h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContainerChart;