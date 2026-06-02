function SecurityMonitoring() {
  const securityAlerts = [
    {
      id: 1,
      title: "Tentative de bruteforce SSH",
      source: "10.10.3.50",
      target: "ECO-MON",
      severity: "Critique",
      tool: "Suricata",
      time: "Il y a 4 min",
      status: "Bloqué",
    },
    {
      id: 2,
      title: "Scan de ports détecté",
      source: "185.22.14.90",
      target: "ECO-PROXY",
      severity: "Élevé",
      tool: "Wazuh",
      time: "Il y a 18 min",
      status: "En analyse",
    },
    {
      id: 3,
      title: "Pic de logs applicatifs",
      source: "ECO-APP",
      target: "ELK Stack",
      severity: "Moyen",
      tool: "ELK",
      time: "Il y a 35 min",
      status: "Surveillé",
    },
  ];

  const infrastructure = [
    {
      id: 1,
      name: "ECO-PROXY",
      role: "Reverse Proxy / WAF",
      zone: "DMZ",
      status: "Opérationnel",
      load: 42,
    },
    {
      id: 2,
      name: "ECO-APP",
      role: "Backend API",
      zone: "LAN",
      status: "Opérationnel",
      load: 58,
    },
    {
      id: 3,
      name: "ECO-MON",
      role: "Monitoring / Logs",
      zone: "Management",
      status: "Surveillé",
      load: 76,
    },
    {
      id: 4,
      name: "ECO-MQTT",
      role: "Broker IoT",
      zone: "IoT",
      status: "Opérationnel",
      load: 34,
    },
  ];

  const rules = [
    {
      id: 1,
      name: "Bruteforce SSH",
      description: "Détecte plusieurs tentatives SSH en moins d’une minute.",
      status: "Active",
    },
    {
      id: 2,
      name: "Scan de ports",
      description: "Détecte un scan SYN vers plusieurs ports.",
      status: "Active",
    },
    {
      id: 3,
      name: "Injection SQL",
      description: "Surveille les patterns SQL suspects dans les requêtes.",
      status: "Active",
    },
    {
      id: 4,
      name: "Trafic IoT anormal",
      description: "Détecte un volume excessif provenant d’un capteur.",
      status: "Active",
    },
  ];

  const criticalAlerts = securityAlerts.filter(
    (alert) => alert.severity === "Critique"
  ).length;

  const highAlerts = securityAlerts.filter(
    (alert) => alert.severity === "Élevé"
  ).length;

  const activeRules = rules.filter((rule) => rule.status === "Active").length;

  const operationalServers = infrastructure.filter(
    (server) => server.status === "Opérationnel"
  ).length;

  const getSeverityClass = (severity) => {
    if (severity === "Critique") return "critical";
    if (severity === "Élevé") return "high";
    return "medium";
  };

  const getLoadClass = (load) => {
    if (load >= 75) return "critical";
    if (load >= 55) return "warning";
    return "normal";
  };

  return (
    <div className="security-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Monitoring sécurité</span>
          <h1>Supervision Cyber</h1>
          <p>
            Suivi des alertes IDS, événements SIEM, règles de détection et état
            de l’infrastructure de sécurité ECOTRACK.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card danger">
          <span>Alertes critiques</span>
          <strong>{criticalAlerts}</strong>
        </div>

        <div className="overview-card warning">
          <span>Alertes élevées</span>
          <strong>{highAlerts}</strong>
        </div>

        <div className="overview-card success">
          <span>Règles actives</span>
          <strong>{activeRules}</strong>
        </div>

        <div className="overview-card">
          <span>Serveurs opérationnels</span>
          <strong>{operationalServers}</strong>
        </div>
      </div>

      <div className="security-grid">
        <section className="security-card large">
          <div className="security-card-header">
            <div>
              <h2>Alertes de sécurité</h2>
              <p>Événements détectés par Suricata, Wazuh et ELK.</p>
            </div>
          </div>

          <div className="security-alerts-list">
            {securityAlerts.map((alert) => (
              <article className="security-alert-row" key={alert.id}>
                <div className="security-alert-main">
                  <span
                    className={`security-dot ${getSeverityClass(
                      alert.severity
                    )}`}
                  ></span>

                  <div>
                    <h3>{alert.title}</h3>
                    <p>
                      Source {alert.source} vers {alert.target}
                    </p>
                  </div>
                </div>

                <div className="security-alert-meta">
                  <span>{alert.tool}</span>
                  <span>{alert.time}</span>
                  <strong
                    className={`severity-badge ${getSeverityClass(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </strong>
                  <strong className="security-status">{alert.status}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="security-card">
          <h2>Règles IDS</h2>

          <div className="security-rules-list">
            {rules.map((rule) => (
              <article className="security-rule-item" key={rule.id}>
                <div>
                  <h3>{rule.name}</h3>
                  <p>{rule.description}</p>
                </div>

                <span>{rule.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="security-card">
        <h2>État de l’infrastructure</h2>

        <div className="infrastructure-grid">
          {infrastructure.map((server) => (
            <article className="infrastructure-card" key={server.id}>
              <div className="infrastructure-header">
                <div>
                  <h3>{server.name}</h3>
                  <p>{server.role}</p>
                </div>

                <span>{server.zone}</span>
              </div>

              <div className="server-status-row">
                <span>{server.status}</span>
                <strong>{server.load}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${getLoadClass(server.load)}`}
                  style={{ width: `${server.load}%` }}
                ></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SecurityMonitoring;