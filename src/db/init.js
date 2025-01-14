const { Pool } = require('pg');
const config = require("../config/config");



const pool = new Pool({
    host: config.db.HOST,
    user: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.NAME,
    port: config.db.PORT,
});

const query = (text, params, callback) => {
    return pool.query(text, params, callback);
};





module.exports = pool;