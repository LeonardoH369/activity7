require('dotenv').config({ quiet: true });
const base = { dialect: 'mysql', host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), username: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', logging: false, timezone: '+00:00' };
module.exports = {
  development: { ...base, database: process.env.DB_NAME || 'activity_9' },
  production: { ...base, database: process.env.DB_NAME || 'activity_9' },
  test: { ...base, database: 'activity_9_test' }
};
