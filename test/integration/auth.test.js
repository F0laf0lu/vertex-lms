const request = require("supertest");
const { faker } = require("@faker-js/faker");
const {status} = require("http-status");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const ApiError = require("../../src/utils/error.util");
const JWT = require("jsonwebtoken");
const emailService = require("../../src/services/email.service");
const { studentOne, createUser, studentTwo, invalidTestUser, instructorOne } = require("../fixtures/user.fixture");
const { studentOneToken, studentTwoToken, instructorOneToken, generateToken, generateExpiryToken } = require("../fixtures/token.fixture");

jest.mock("../../src/services/email.service", () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue("Email mock sent"),
    sendPasswordResetEmail: jest.fn().mockResolvedValue("Email mock sent")
}));

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
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
                newUser.email,
                expect.any(String)
            );
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

    describe("POST /auth/verify", ()=>{
        test("should test user email is verified", async () => {
            await createUser(studentOne);
            const token = studentOneToken;
            const res = await request(app)
                .post("/auth/verify-email")
                .send({ token })
                .expect(status.OK);
            expect(res.body.data.isverified).toBe(true);
        });

        test('should send 400 is user is verified', async()=>{
            studentTwo.isverified = true
            await createUser(studentTwo);
            const verifiedToken = studentTwoToken;
            const res = await request(app)
                .post("/auth/verify-email")
                .send({ token: verifiedToken })
                .expect(status.BAD_REQUEST);

                expect(res.body.message).toBe("User is already verified.");
        })

        test('should request from invalid user id', async()=>{
            //instructor one is not inserted into the database yet
            const unverifiedtoken = instructorOneToken
            const res = await request(app)
                .post("/auth/verify-email")
                .send({ token: unverifiedtoken })
                .expect(status.BAD_REQUEST);
                expect(res.body.message).toBe("User not found.");
        })
    })

    describe("POST /forgot-password", () => {
        it("should send a password reset email if user exists", async () => {
            const user = studentOne
            const res = await request(app)
                .post("/auth/forgot-password")
                .send({ email: user.email });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: "Password reset link sent successfully.",
            });
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
                user.email,
                expect.any(String)
            );
            
        });

        it("should return 404 if user does not exist", async () => {
            const user = invalidTestUser

            const res = await request(app)
                .post("/auth/forgot-password")
                .send({ email: invalidTestUser.email });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });

    describe("POST /reset-password", () => {
        it("should reset the password with a valid token", async () => {
            const token = studentOneToken;
            const res = await request(app)
                .post("/auth/reset-password")
                .send({ newPassword: "newPassword123", token });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: "Password reset successfully. You can now log in.",
            });
        });

        it("should return 401 for invalid or expired token", async () => {
            const expiredToken = generateExpiryToken(studentOne)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const res = await request(app)
                .post("/auth/reset-password")
                .send({ newPassword: "newPassword123", token: expiredToken });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("message", "Invalid or expired token");
        });
    });

    describe("POST /request-verification-email", () => {
        it("should send a verification email if user is not verified", async () => {
            const user = await createUser(instructorOne)
            const authToken = instructorOneToken
            const res = await request(app)
                .post("/auth/resend-verification")
                .send({ email: instructorOne.email })
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                message: "Verification email has been sent. Please check your inbox.",
            });
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
                instructorOne.email,
                expect.any(String)
            );
        });

        it("should return 403 if user is not authorized", async () => {

            const res = await request(app)
                .post("/auth/resend-verification")
                .send({ email: "user@example.com" })
                .set("Authorization", "Bearer validToken");

            expect(res.statusCode).toBe(401);
        });

        it("should return 200 if user is already verified", async () => {
            const user = studentOne;
            const token = studentOneToken

            const res = await request(app)
                .post("/auth/resend-verification")
                .send({ email: studentOne.email })
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                message: "Your account is already verified.",
            });
        });
    });




});


