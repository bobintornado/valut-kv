const pgp = require('pg-promise')();
const db_url = process.env.NODE_ENV == 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
const db = pgp(db_url);

module.exports = db;
