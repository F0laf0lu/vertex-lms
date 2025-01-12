const { Pool } = require('pg');
const config = require("../config/config");



const pool = new Pool({
    host: config.db.HOST,
    user: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.NAME,
    port: config.db.PORT,
});


pool.on('connect', ()=>{
    console.log('Connected to the database')
})



module.exports = pool;