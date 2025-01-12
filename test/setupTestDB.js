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
        client = await pool.connect(); // Acquire a client
        // console.log("Connected to the test database");
    });

    beforeEach(async () => {
        await client.query("BEGIN");
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
    });

    afterAll(async () => {
        client.release(); 
        await pool.end(); 
        // console.log("Closed the test database connection");
    });
};

module.exports = { setupTestDB, pool };
