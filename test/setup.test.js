const request = require("supertest");
const { status } = require("http-status");
const app = require("../src/app");
const { setupTestDB, pool } = require("./setupTestDB");



describe("User Repository Tests", () => {
    setupTestDB();

    test("should insert a user into the test database", async () => {
        const res = await pool.query(
            "INSERT INTO users (email, firstname, lastname) VALUES ($1, $2, $3) RETURNING *",
            ["TestUser@gmail", "Test", "User" ]
        );

        expect(res.rows[0].email).toBe("Test User");
    });
});