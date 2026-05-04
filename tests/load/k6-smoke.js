// K6 Smoke Test — validates the API responds correctly at low load
// Usage: k6 run tests/load/k6-smoke.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const errorRate = new Rate("errors");
const authDuration = new Trend("auth_duration_ms");
const apiDuration = new Trend("api_duration_ms");
const requests = new Counter("requests_total");

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.05"],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: "test@ecotrack.com", password: "TestPassword123!" }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (res.status !== 200) {
    console.error(`Setup failed: ${res.status} — ${res.body}`);
    return { token: null };
  }

  return { token: JSON.parse(res.body).access_token };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: data.token ? `Bearer ${data.token}` : "",
  };

  // Health check
  const health = http.get(`${BASE_URL}/health/ready`);
  requests.add(1);
  check(health, { "health ready 200": (r) => r.status === 200 }) || errorRate.add(1);

  // Metrics endpoint
  const metrics = http.get(`${BASE_URL}/metrics`);
  requests.add(1);
  check(metrics, { "metrics 200": (r) => r.status === 200 }) || errorRate.add(1);

  // Protected API — containers list
  const start = Date.now();
  const containers = http.get(`${BASE_URL}/api/containers`, { headers });
  requests.add(1);
  apiDuration.add(Date.now() - start);
  check(containers, {
    "containers 200 or 401": (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);
}

export function teardown(data) {
  console.log(`Smoke test completed. Token used: ${data.token ? "yes" : "no"}`);
}
