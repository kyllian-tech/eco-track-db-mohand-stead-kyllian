// M8.3 — Analytics Aggregation Consumer
// Consumes iot.measurements events and aggregates fill levels by 5-minute windows
// In production: requires 'kafkajs' package

const { KAFKA_CONFIG, TOPICS } = require("./config");
const logger = require("../utils/logger");
const { counter, gauge, histogramObserve } = require("../modules/metrics/metrics.service");

class MeasurementConsumer {
  constructor() {
    this.client = null;
    this.running = false;
    this.aggregationBuffer = new Map();
    this.WINDOW_MS = 5 * 60 * 1000;
  }

  async start() {
    if (this.running) return;

    try {
      // Production: const { Kafka } = require('kafkajs');
      // const kafka = new Kafka(KAFKA_CONFIG);
      // this.client = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'ecotrack-consumers' });
      // await this.client.connect();
      // await this.client.subscribe({ topic: TOPICS.IOT_MEASUREMENTS.name, fromBeginning: false });
      // await this.client.run({ eachMessage: this.processMessage.bind(this) });

      this.running = true;
      logger.info("Measurement consumer started", {
        topic: TOPICS.IOT_MEASUREMENTS.name,
        groupId: process.env.KAFKA_GROUP_ID || "ecotrack-consumers",
      });

      // Start aggregation flush timer
      this.flushInterval = setInterval(() => this.flushAggregations(), this.WINDOW_MS);
    } catch (err) {
      logger.error("Consumer start failed", { error: err.message });
      throw err;
    }
  }

  async processMessage({ topic, partition, message }) {
    const start = Date.now();

    try {
      const value = JSON.parse(message.value.toString());
      const { container_id, fill_level, measured_at } = value;

      // Aggregate: track min/max/avg per container per window
      const windowKey = `${container_id}:${this.getWindowKey(new Date(measured_at))}`;
      const existing = this.aggregationBuffer.get(windowKey) || {
        container_id,
        window_start: this.getWindowStart(new Date(measured_at)),
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
      };

      existing.count += 1;
      existing.sum += fill_level;
      existing.min = Math.min(existing.min, fill_level);
      existing.max = Math.max(existing.max, fill_level);
      this.aggregationBuffer.set(windowKey, existing);

      // Update real-time gauge
      gauge("ecotrack_container_fill_level", fill_level, { container_id });

      // Alert if fill level >= 85%
      if (fill_level >= 85) {
        await this.triggerFullAlert(container_id, fill_level);
      }

      counter("kafka_messages_consumed_total", { topic });
      histogramObserve("kafka_consume_processing_seconds", (Date.now() - start) / 1000, { topic });
    } catch (err) {
      counter("kafka_consume_errors_total", { topic });
      logger.error("Error processing measurement message", { error: err.message, partition });
      // Send to DLQ
      await this.sendToDLQ(message, err.message);
    }
  }

  async flushAggregations() {
    if (this.aggregationBuffer.size === 0) return;

    const aggregations = Array.from(this.aggregationBuffer.values()).map((agg) => ({
      ...agg,
      avg: agg.sum / agg.count,
      flushed_at: new Date().toISOString(),
    }));

    // In production: persist to PostgreSQL (aggregates_5min table)
    // await db.query('INSERT INTO aggregates_5min (...) VALUES ...', aggregations);

    logger.info("Flushed aggregations", { count: aggregations.length });
    gauge("kafka_aggregation_buffer_size", 0, {});
    this.aggregationBuffer.clear();
  }

  async triggerFullAlert(containerId, fillLevel) {
    logger.warn("Container fill level critical", { container_id: containerId, fill_level: fillLevel });
    counter("ecotrack_alerts_container_full_total", { container_id: containerId });
    // In production: emit to notifications Kafka topic
  }

  async sendToDLQ(message, errorMessage) {
    logger.error("Message sent to DLQ", { error: errorMessage });
    // In production: produce to TOPICS.DLQ
  }

  getWindowKey(date) {
    const windowStart = this.getWindowStart(date);
    return windowStart.getTime().toString();
  }

  getWindowStart(date) {
    const ms = date.getTime();
    return new Date(ms - (ms % this.WINDOW_MS));
  }

  async stop() {
    if (!this.running) return;
    clearInterval(this.flushInterval);
    await this.flushAggregations();
    if (this.client) await this.client.disconnect();
    this.running = false;
    logger.info("Measurement consumer stopped");
  }
}

const consumer = new MeasurementConsumer();

module.exports = consumer;
