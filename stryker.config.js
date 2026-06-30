/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 *
 * Démarrage volontairement restreint : on mute uniquement bins.service.js,
 * le seul fichier disposant aujourd'hui de tests unitaires dédiés et
 * indépendants de Supabase (tests/unit/bins.service.test.js).
 * Étendre `mutate` à d'autres services au fur et à mesure qu'ils gagnent
 * leurs propres tests unitaires.
 */
module.exports = {
  packageManager: "npm",
  testRunner: "command",
  commandRunner: {
    command: "npm run test:unit",
  },
  mutate: ["src/modules/bins/bins.service.js"],
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation.json",
  },
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  tempDirName: "stryker-tmp",
  cleanTempDir: true,
};
