// K6 Stress Test — validates behavior under heavy load and spike scenarios
// Usage: k6 run tests/load/k6-stress.js --out json=results/stress.json
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const errorRate = new Rate("errors");
const p95Duration = new Trend("p95_duration");
const rps = new Counter("requests_per_second");

export const options = {
  scenarios: {
    // Ramp-up scenario
    ramp_up: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "5m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "5m", target: 100 },
        { duration: "2m", target: 0 },
      ],
    },
    // Spike scenario (runs after ramp-up)
    spike: {
      executor: "ramping-vus",
      startTime: "16m",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 500 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.1"],
  },
};

let token = null;

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: "test@ecotrack.com", password: "TestPassword123!" }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (res.status === 200) {
    token = JSON.parse(res.body).access_token;
  }
  return { token };
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  group("health_checks", () => {
    const r = http.get(`${BASE_URL}/health/live`);
    rps.add(1);
    check(r, { "liveness 200": (res) => res.status === 200 }) || errorRate.add(1);
    p95Duration.add(r.timings.duration);
  });

  group("api_load", () => {
    const endpoints = [
      `/api/containers`,
      `/api/zones`,
      `/api/badges`,
    ];

    for (const ep of endpoints) {
      const r = http.get(`${BASE_URL}${ep}`, { headers });
      rps.add(1);
      check(r, {
        [`${ep} status ok`]: (res) => res.status < 500,
      }) || errorRate.add(1);
      p95Duration.add(r.timings.duration);
    }
  });

  group("auth_refresh", () => {
    // Test rate-limit on auth endpoint
    const r = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: "invalid@ecotrack.com", password: "wrong" }),
      { headers: { "Content-Type": "application/json" } }
    );
    rps.add(1);
    check(r, { "auth rejects invalid credentials": (res) => res.status === 401 || res.status === 429 });
  });

  sleep(0.1);
}
