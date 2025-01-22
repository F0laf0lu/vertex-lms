const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const ApiError = require("../../src/utils/error.util");
const {admin, instructorOne, createUser, studentOne} = require("../fixtures/user.fixture")
const generateToken = require("../fixtures/token.fixture")


describe('Course Routes', () => { 
    let authToken;

    beforeAll(async () => {
        const user = await createUser(instructorOne)
        authToken = generateToken(user);
    });

    afterAll(async () => {
        await pool.query("DELETE FROM users")
        await pool.query("DELETE FROM course")
        await pool.query("DELETE FROM instructors")
        await pool.end();
    });


    describe('POST courses/', () => { 
        beforeEach(()=>{
            newCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };
        });

        test('should create course if data is ok', async() => {
                const res = await request(app)
                    .post("/courses")
                    .set("Authorization", `Bearer ${authToken}`)
                    .send(newCourse)
                    .expect(status.CREATED);

                    expect(res.body.data).toBeDefined()
                    expect(res.body.data.name).toBe(newCourse.name);
                    expect(res.body.data.difficulty).toBe(newCourse.difficulty);
        })

        test('should not create course if user is not an instructor', async() => { 
            let user = await createUser(studentOne)
            let token = generateToken(user)
            await request(app)
                .post("/courses")
                .set("Authorization", `Bearer ${token}`)
                .send(newCourse)
                .expect(status.FORBIDDEN)
                
        })

        test('should not create course if user is unauthenticated', async() => { 
            await request(app).post("/courses")
                    .expect(status.UNAUTHORIZED)
        })

    });

});