function StatCard({ title, value, subtitle, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <p className="stat-title">{title}</p>
      <h2>{value}</h2>
      <span>{subtitle}</span>
    </div>
  );
}

export default StatCard;