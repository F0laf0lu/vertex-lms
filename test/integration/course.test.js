const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const {admin, instructorOne, createUser, studentOne, instructorTwo} = require("../fixtures/user.fixture")
const tokenFixtures = require("../fixtures/token.fixture")


describe('Course Routes', () => { 
    let authToken;

    beforeAll(async () => {
        const user = await createUser(instructorOne)
        authToken = tokenFixtures.instructorOneToken
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
            await createUser(studentOne)
            let token = tokenFixtures.studentOneToken
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


    describe('GET courses', () => { 
        beforeEach(async() => {
            newCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };
        // Create a course to test retrieval
        const res = await request(app)
            .post("/courses")
            .set("Authorization", `Bearer ${authToken}`)
            .send(newCourse)
            .expect(status.CREATED);

            courseId = res.body.data.id;
        });

        test('should get all course', async() => { 
            const res = await request(app).get('/courses')
                    .expect(status.OK)
        })

        test("should retrieve a specific course", async () => {
            const res = await request(app).get(`/courses/${courseId}`).expect(status.OK);

            expect(res.body.data).toBeDefined();
            expect(res.body.data.id).toBe(courseId);
            expect(res.body.data.name).toBe(newCourse.name);
        });


        test("should return 404 if course not found", async () => {
            const invalidCourseId = "47d3f0e3-dd86-4ff5-98a6-26f56ecca369";
            const res = await request(app).get(`/courses/${invalidCourseId}`).expect(status.NOT_FOUND);

            expect(res.body.message).toBe("Course not found");
        });

    })


    describe("PUT /courses/:id", () => {
        let courseId;

        beforeEach(async () => {
            newCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };

            // Create a course to test update
            const res = await request(app)
                .post("/courses")
                .set("Authorization", `Bearer ${authToken}`)
                .send(newCourse)
                .expect(status.CREATED);

            courseId = res.body.data.id;
        });

        test("should update course if user is the course owner", async () => {
            const updatedCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };

            const res = await request(app)
                .patch(`/courses/${courseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updatedCourse)
                .expect(status.OK);

            expect(res.body.data.name).toBe(updatedCourse.name);
            expect(res.body.data.description).toBe(updatedCourse.description);
        });

        test("should reject update if user is not the course owner", async () => {
            let user = await createUser(instructorTwo);
            let token = tokenFixtures.instructorTwoToken;

            const updatedCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };

            const res = await request(app)
                .patch(`/courses/${courseId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updatedCourse)
                .expect(status.FORBIDDEN);

            expect(res.body.message).toBe("Access denied: Not the course instructor.");
        });

        test("should not update course if unauthenticated", async () => {
            const updatedCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };

            await request(app)
                .patch(`/courses/${courseId}`)
                .send(updatedCourse)
                .expect(status.UNAUTHORIZED);
        });
    });

    describe("DELETE /courses/:id", () => {
        let courseId;

        beforeEach(async () => {
            newCourse = {
                name: faker.lorem.word(5),
                description: faker.lorem.sentence(),
                difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
            };

            // Create a course to test deletion
            const res = await request(app)
                .post("/courses")
                .set("Authorization", `Bearer ${authToken}`)
                .send(newCourse)
                .expect(status.CREATED);

            courseId = res.body.data.id;
        });

        test("should delete course if user is the course owner", async () => {
            await request(app)
                .delete(`/courses/${courseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(status.OK);
        });

        test("should reject delete if user is not the course owner", async () => {
            let token = tokenFixtures.instructorTwoToken;

            const res = await request(app)
                .delete(`/courses/${courseId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(status.FORBIDDEN);

            expect(res.body.message).toBe("Access denied: Not the course instructor.");
        });

        test("should not delete course if unauthenticated", async () => {
            await request(app).delete(`/courses/${courseId}`).expect(status.UNAUTHORIZED);
        });

        test("should return 404 if course does not exist", async () => {
            const invalidCourseId = "47d3f0e3-dd86-4ff5-98a6-26f56ecca369";
            const res = await request(app)
                .delete(`/courses/${invalidCourseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(status.NOT_FOUND);

            expect(res.body.message).toBe("Course not found");
        });
    });

});