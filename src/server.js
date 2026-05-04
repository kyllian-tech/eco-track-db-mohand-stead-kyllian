const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const logger = require("./utils/logger");

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info("API running", { port, environment: process.env.NODE_ENV || "development" });
});
