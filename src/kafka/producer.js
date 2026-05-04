// M8.2 — IoT Measurements Kafka Producer
// Produces sensor data events to iot.measurements topic
// In production: replace KafkaClient stub with 'kafkajs' package

const { KAFKA_CONFIG, TOPICS } = require("./config");
const logger = require("../utils/logger");
const { counter, histogramObserve } = require("../modules/metrics/metrics.service");

class KafkaProducer {
  constructor() {
    this.connected = false;
    this.client = null;
  }

  async connect() {
    if (this.connected) return;

    try {
      // Production: const { Kafka } = require('kafkajs');
      // const kafka = new Kafka(KAFKA_CONFIG);
      // this.client = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });
      // await this.client.connect();

      // Stub for environments without Kafka
      this.client = { send: async (data) => ({ partition: 0, offset: "0" }), disconnect: async () => {} };
      this.connected = true;
      logger.info("Kafka producer connected", { brokers: KAFKA_CONFIG.brokers });
    } catch (err) {
      logger.error("Kafka producer connect failed", { error: err.message });
      throw err;
    }
  }

  async disconnect() {
    if (!this.connected) return;
    await this.client.disconnect();
    this.connected = false;
    logger.info("Kafka producer disconnected");
  }

  async sendMeasurement(data) {
    await this.ensureConnected();
    const start = Date.now();

    const message = {
      key: data.container_id,
      value: JSON.stringify({
        event_type: "iot.measurement.received",
        event_id: data.id,
        container_id: data.container_id,
        fill_level: data.fill_level,
        battery_level: data.battery_level,
        sensor_id: data.sensor_id,
        measured_at: data.measured_at || new Date().toISOString(),
        schema_version: "1.0",
      }),
      headers: {
        "event-type": "iot.measurement.received",
        "content-type": "application/json",
        "producer-id": KAFKA_CONFIG.clientId,
      },
      timestamp: Date.now().toString(),
    };

    try {
      const result = await this.client.send({
        topic: TOPICS.IOT_MEASUREMENTS.name,
        messages: [message],
        acks: -1,
      });

      counter("kafka_messages_produced_total", { topic: TOPICS.IOT_MEASUREMENTS.name });
      histogramObserve("kafka_produce_duration_seconds", (Date.now() - start) / 1000, {
        topic: TOPICS.IOT_MEASUREMENTS.name,
      });

      return result;
    } catch (err) {
      counter("kafka_produce_errors_total", { topic: TOPICS.IOT_MEASUREMENTS.name });
      logger.error("Failed to produce measurement event", { error: err.message, container_id: data.container_id });
      throw err;
    }
  }

  async sendContainerEvent(eventType, payload) {
    await this.ensureConnected();

    const message = {
      key: payload.container_id || payload.id,
      value: JSON.stringify({
        event_type: eventType,
        ...payload,
        emitted_at: new Date().toISOString(),
        schema_version: "1.0",
      }),
      headers: { "event-type": eventType },
    };

    return this.client.send({ topic: TOPICS.CONTAINER_EVENTS.name, messages: [message], acks: -1 });
  }

  async sendSignalementEvent(signalement) {
    await this.ensureConnected();

    const message = {
      key: signalement.id,
      value: JSON.stringify({
        event_type: "signalement.created",
        signalement_id: signalement.id,
        container_id: signalement.container_id,
        user_id: signalement.user_id,
        type: signalement.type,
        description: signalement.description,
        emitted_at: new Date().toISOString(),
      }),
    };

    return this.client.send({ topic: TOPICS.SIGNALEMENT_EVENTS.name, messages: [message], acks: -1 });
  }

  async sendGamificationEvent(userId, points, reason) {
    await this.ensureConnected();

    const message = {
      key: userId,
      value: JSON.stringify({
        event_type: "gamification.points.awarded",
        user_id: userId,
        points,
        reason,
        emitted_at: new Date().toISOString(),
      }),
    };

    return this.client.send({ topic: TOPICS.GAMIFICATION_EVENTS.name, messages: [message], acks: -1 });
  }

  async sendAuditLog(auditEntry) {
    await this.ensureConnected();

    const message = {
      key: auditEntry.actor || "system",
      value: JSON.stringify({ ...auditEntry, schema_version: "1.0" }),
      headers: { "audit": "true" },
    };

    return this.client.send({ topic: TOPICS.AUDIT_LOGS.name, messages: [message], acks: -1 });
  }

  async ensureConnected() {
    if (!this.connected) await this.connect();
  }
}

// Singleton instance
const producer = new KafkaProducer();

module.exports = producer;
