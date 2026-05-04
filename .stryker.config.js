// Stryker Mutation Testing configuration (M10.4)
// Usage: npx stryker run
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  packageManager: "npm",
  reporters: ["html", "json", "clear-text", "progress"],
  testRunner: "node-test",
  coverageAnalysis: "perTest",
  mutate: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/**",
    "!src/data/**",
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/report.json",
  },
  timeoutMS: 10000,
  concurrency: 4,
  mutator: {
    plugins: [],
    excludedMutations: [
      "StringLiteral",  // Avoid noise from string mutations
    ],
  },
};
