/** @type {import('sequelize').Options} */
const resolveLogging = (raw) => {
  if (raw === undefined || raw === null || raw === "") return false;
  if (raw === "true") return console.log;
  if (raw === "false") return false;
  return console.log;
};

module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: process.env.DEV_DB_PORT ? parseInt(process.env.DEV_DB_PORT, 10) : undefined,
    dialect: process.env.DEV_DB_DIALECT,
    logging: resolveLogging(process.env.DEV_DB_LOGGING),
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    port: process.env.TEST_DB_PORT ? parseInt(process.env.TEST_DB_PORT, 10) : undefined,
    dialect: process.env.TEST_DB_DIALECT,
    logging: resolveLogging(process.env.TEST_DB_LOGGING),
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT ? parseInt(process.env.PROD_DB_PORT, 10) : undefined,
    dialect: process.env.PROD_DB_DIALECT,
    logging: resolveLogging(process.env.PROD_DB_LOGGING),
  },
};
