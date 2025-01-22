const config = require("../src/config/config");
const { Pool } = require("pg");

const pool = new Pool({
    host: config.db.HOST,
    user: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.NAME,
    port: config.db.PORT,
});

const setupTestDB = () => {
    let client;

    beforeAll(async () => {
        client = await pool.connect(); 
    });

    beforeEach(async () => {
        await client.query("BEGIN");
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
    });

    afterAll(async () => {
        if (client) {
            client.release(); 
        }
        await pool.end();
    });
};

module.exports = { setupTestDB, pool };
