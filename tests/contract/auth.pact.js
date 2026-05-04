// M10.7 — Tests de Contrat Pact (Consumer-Driven Contracts)
// Consumer: Mobile App / Dashboard
// Provider: EcoTrack API

// Note: In production, install pact with: npm install --save-dev @pact-foundation/pact

const { Pact } = require("@pact-foundation/pact");
const path = require("path");

const provider = new Pact({
  consumer: "ecotrack-mobile",
  provider: "ecotrack-api",
  port: 3001,
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  logLevel: "warn",
});

describe("EcoTrack API — Auth Contract", () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe("POST /api/auth/login", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "a user exists with email test@ecotrack.com",
        uponReceiving: "a valid login request",
        withRequest: {
          method: "POST",
          path: "/api/auth/login",
          headers: { "Content-Type": "application/json" },
          body: {
            email: "test@ecotrack.com",
            password: "TestPassword123!",
          },
        },
        willRespondWith: {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: {
            access_token: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
            refresh_token: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
            user: {
              id: expect.stringMatching(/^[0-9a-f-]{36}$/),
              email: "test@ecotrack.com",
              role: expect.stringMatching(/admin|gestionnaire|agent|citoyen|analyst/),
            },
          },
        },
      });
    });

    it("returns JWT tokens on valid login", async () => {
      const response = await fetch(`${provider.mockService.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@ecotrack.com", password: "TestPassword123!" }),
      });
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.access_token).toBeDefined();
      expect(body.refresh_token).toBeDefined();
    });

    afterEach(() => provider.verify());
  });

  describe("GET /api/containers", () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: "containers exist",
        uponReceiving: "an authenticated request to list containers",
        withRequest: {
          method: "GET",
          path: "/api/containers",
          headers: { Authorization: "Bearer valid-token" },
        },
        willRespondWith: {
          status: 200,
          body: {
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.stringMatching(/^[0-9a-f-]{36}$/),
                fill_level: expect.any(Number),
              }),
            ]),
          },
        },
      });
    });

    it("returns paginated container list", async () => {
      const response = await fetch(`${provider.mockService.baseUrl}/api/containers`, {
        headers: { Authorization: "Bearer valid-token" },
      });
      expect(response.status).toBe(200);
    });

    afterEach(() => provider.verify());
  });
});
