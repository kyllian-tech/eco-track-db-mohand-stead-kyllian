const os = require("os");

// In-memory Prometheus-compatible metrics store
const counters = new Map();
const gauges = new Map();
const histograms = new Map();

function counter(name, labels = {}) {
  const key = formatKey(name, labels);
  counters.set(key, (counters.get(key) || 0) + 1);
}

function gauge(name, value, labels = {}) {
  const key = formatKey(name, labels);
  gauges.set(key, { value, labels, name });
}

function histogramObserve(name, value, labels = {}, buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]) {
  const key = formatKey(name, labels);
  const existing = histograms.get(key) || { count: 0, sum: 0, buckets: Object.fromEntries(buckets.map((b) => [b, 0])), name, labels };
  existing.count += 1;
  existing.sum += value;
  for (const b of buckets) {
    if (value <= b) existing.buckets[b] += 1;
  }
  histograms.set(key, existing);
}

function formatKey(name, labels) {
  const labelsStr = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(",");
  return labelsStr ? `${name}{${labelsStr}}` : name;
}

function formatLabels(labels) {
  const entries = Object.entries(labels || {});
  if (!entries.length) return "";
  return `{${entries.map(([k, v]) => `${k}="${v}"`).join(",")}}`;
}

function collectSystemMetrics() {
  const mem = process.memoryUsage();
  gauge("process_heap_bytes", mem.heapUsed, {});
  gauge("process_heap_total_bytes", mem.heapTotal, {});
  gauge("process_rss_bytes", mem.rss, {});
  gauge("process_uptime_seconds", process.uptime(), {});
  gauge("nodejs_eventloop_lag_seconds", 0, {});
  gauge("os_free_memory_bytes", os.freemem(), {});
  gauge("os_total_memory_bytes", os.totalmem(), {});
  gauge("os_load_average", os.loadavg()[0], { interval: "1m" });
}

function renderMetrics() {
  collectSystemMetrics();
  const lines = [];

  // Counters
  for (const [key, value] of counters) {
    const name = key.split("{")[0];
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${key} ${value}`);
  }

  // Gauges
  const gaugeNames = new Set();
  for (const [key, { value, name }] of gauges) {
    if (!gaugeNames.has(name)) {
      lines.push(`# TYPE ${name} gauge`);
      gaugeNames.add(name);
    }
    lines.push(`${key} ${value}`);
  }

  // Histograms
  for (const [, h] of histograms) {
    const labelStr = formatLabels(h.labels);
    lines.push(`# TYPE ${h.name} histogram`);
    for (const [b, count] of Object.entries(h.buckets)) {
      lines.push(`${h.name}_bucket{le="${b}"${labelStr ? "," + labelStr.slice(1, -1) : ""}} ${count}`);
    }
    lines.push(`${h.name}_bucket{le="+Inf"${labelStr ? "," + labelStr.slice(1, -1) : ""}} ${h.count}`);
    lines.push(`${h.name}_sum${labelStr} ${h.sum}`);
    lines.push(`${h.name}_count${labelStr} ${h.count}`);
  }

  return lines.join("\n") + "\n";
}

// Business metrics helpers
function recordHttpRequest(method, route, statusCode, durationSeconds) {
  counter("http_requests_total", { method, route, status: String(statusCode) });
  histogramObserve("http_request_duration_seconds", durationSeconds, { method, route });
}

function recordSignalement() {
  counter("ecotrack_signalements_created_total", {});
}

function recordTournee(status) {
  counter("ecotrack_tournees_total", { status });
}

function recordContainerFillLevel(containerId, level) {
  gauge("ecotrack_container_fill_level", level, { container_id: containerId });
}

function recordGamificationPoints(userId, points) {
  counter("ecotrack_gamification_points_total", { user_id: userId });
}

module.exports = {
  counter,
  gauge,
  histogramObserve,
  renderMetrics,
  recordHttpRequest,
  recordSignalement,
  recordTournee,
  recordContainerFillLevel,
  recordGamificationPoints,
};
