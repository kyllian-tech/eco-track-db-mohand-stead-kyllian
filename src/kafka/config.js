const KAFKA_CONFIG = {
  clientId: process.env.KAFKA_CLIENT_ID || "ecotrack-api",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  ssl: process.env.KAFKA_SSL === "true",
  sasl: process.env.KAFKA_SASL_USERNAME
    ? {
        mechanism: "scram-sha-512",
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
      }
    : undefined,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
  connectionTimeout: 3000,
  requestTimeout: 30000,
};

// Topic definitions with partitions, replication, retention
const TOPICS = {
  IOT_MEASUREMENTS: {
    name: "iot.measurements",
    numPartitions: 12,
    replicationFactor: 3,
    configEntries: [
      { name: "retention.ms", value: String(7 * 24 * 3600 * 1000) }, // 7 days
      { name: "compression.type", value: "lz4" },
      { name: "min.insync.replicas", value: "2" },
    ],
  },
  CONTAINER_EVENTS: {
    name: "container.events",
    numPartitions: 6,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(30 * 24 * 3600 * 1000) }],
  },
  TOURNEE_EVENTS: {
    name: "tournee.events",
    numPartitions: 6,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(90 * 24 * 3600 * 1000) }],
  },
  SIGNALEMENT_EVENTS: {
    name: "signalement.events",
    numPartitions: 4,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(30 * 24 * 3600 * 1000) }],
  },
  GAMIFICATION_EVENTS: {
    name: "gamification.events",
    numPartitions: 4,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(90 * 24 * 3600 * 1000) }],
  },
  NOTIFICATIONS: {
    name: "notifications",
    numPartitions: 4,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(24 * 3600 * 1000) }],
  },
  AUDIT_LOGS: {
    name: "audit.logs",
    numPartitions: 4,
    replicationFactor: 3,
    configEntries: [
      { name: "retention.ms", value: String(365 * 24 * 3600 * 1000) }, // 1 year
      { name: "cleanup.policy", value: "delete" },
    ],
  },
  DLQ: {
    name: "dead-letter-queue",
    numPartitions: 2,
    replicationFactor: 3,
    configEntries: [{ name: "retention.ms", value: String(30 * 24 * 3600 * 1000) }],
  },
};

module.exports = { KAFKA_CONFIG, TOPICS };
