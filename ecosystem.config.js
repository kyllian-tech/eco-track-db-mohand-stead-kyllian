module.exports = {
  apps: [
    {
      name: "ecotrack-api",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        LOG_LEVEL: "info"
      }
    }
  ]
};
