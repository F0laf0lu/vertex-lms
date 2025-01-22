const request = require("supertest");
const { faker } = require("@faker-js/faker");
const {status} = require("http-status");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const ApiError = require("../../src/utils/error.util");
const bcrypt = require("bcryptjs");


describe("Auth Routes", () => {
        afterAll(async () => {
            await pool.query("DELETE FROM users");
            await pool.end();
        });

    describe("POST /auth/register", () => {
        let newUser;

        beforeEach(() => {
            newUser = {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                password: "SecurePass123!",
            };
        });

        test("should return 201 and successfully register user if request data is ok", async () => {
            const res = await request(app).post("/auth/register").send(newUser).expect(status.CREATED);
            expect(res.body.user).toBeDefined();
            expect(res.body.user).not.toHaveProperty("password");
        });        
    });

    describe("POST /auth/login", () => {
        let credentials;

        beforeEach(() => {
            credentials = {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                password: "SecurePass123!",
            };
        });

        test("should return 200 and a token if login credentials are correct", async () => {
            await request(app).post("/auth/register").send(credentials);
            const res = await request(app)
                .post("/auth/login")
                .send({
                    email: credentials.email,
                    password: credentials.password,
                })
                .expect(status.OK);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
        });

        test("should return 401 if email or password is incorrect", async () => {
            credentials.password = "WrongPassword!";
            await request(app)
                .post("/auth/login")
                .send({
                    email: credentials.email,
                    password: credentials.password,
                })
                .expect(status.UNAUTHORIZED);
        });
    });
});


