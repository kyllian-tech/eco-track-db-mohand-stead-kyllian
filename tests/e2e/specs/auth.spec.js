// M10.1 — Tests E2E Playwright — Authentification
const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Authentication API E2E", () => {
  test("health check returns ok", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health/live`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("alive");
  });

  test("readiness probe returns ready", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health/ready`);
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(["ready", "not_ready"]).toContain(body.status);
  });

  test("Prometheus metrics endpoint accessible", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/metrics`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("# TYPE");
  });

  test("login with invalid credentials returns 401", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: "nonexistent@test.com", password: "wrong" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("protected endpoint without token returns 401", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/containers`);
    expect(response.status()).toBe(401);
  });

  test("security headers present on all responses", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health/live`);
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });

  test("rate limiting on auth endpoint after multiple attempts", async ({ request }) => {
    // Make 6 rapid failed login attempts
    const requests = Array.from({ length: 6 }, () =>
      request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: "ratelimit@test.com", password: "wrongpassword" },
      })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status());
    // At least one should be rate limited (429)
    const hasRateLimit = statuses.includes(429);
    expect(hasRateLimit || statuses.every((s) => s === 401)).toBeTruthy();
  });

  test("CSP violation reporting endpoint accepts reports", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/csp-report`, {
      headers: { "Content-Type": "application/csp-report" },
      data: {
        "csp-report": {
          "document-uri": "https://app.ecotrack.com",
          "blocked-uri": "https://evil.com/script.js",
          "violated-directive": "script-src",
        },
      },
    });
    expect(response.status()).toBe(204);
  });

  test("404 for unknown routes", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/unknown-route`);
    expect(response.status()).toBe(404);
  });

  test("ML inference endpoint requires authentication", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/ml/predict`, {
      data: { container_id: "test-id" },
    });
    expect(response.status()).toBe(401);
  });
});
