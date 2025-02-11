const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const { status } = require("http-status");
const tokenFixtures = require("../fixtures/token.fixture");
const courseFixtures = require("../fixtures/course.fixtures")

const {
    admin,
    instructorOne,
    createUser,
    studentOne,
    instructorTwo,
} = require("../fixtures/user.fixture");


let courseId;
let moduleId;
let authToken;

beforeAll(async () => {
    // Create a test course
    const userData = await createUser(instructorOne);
    courseFixtures.courseOne.instructor = userData.profileId
    const course = await courseFixtures.createCourse(courseFixtures.courseOne)
    courseId = course.id;

    authToken = tokenFixtures.instructorOneToken
});

afterAll(async () => {
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM course");
    await pool.query("DELETE FROM instructors");
    await pool.query("DELETE FROM module");
    await pool.end();
});

describe("Module Endpoints", () => {
    test("Should create a new module", async () => {
        const res = await request(app)
            .post(`/${courseId}/modules`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                courseId,
                name: "Test Module",
                description: "Module description",
            });
        expect(res.status).toBe(status.CREATED);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("id");
        moduleId = res.body.data.id;
    });

    test("Should not create a new module if course id is invalid", async () => {
        let invalidCourseId = courseFixtures.invalidCourse.id
        const res = await request(app)
            .post(`/${invalidCourseId}/modules`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                courseId:invalidCourseId,
                name: "Test Module",
                description: "Module description",
            });
        expect(res.status).toBe(status.NOT_FOUND);
    });

    test("Should not create a new module if not course instructor", async () => {
        await createUser(instructorTwo)
        const res = await request(app)
            .post(`/${courseId}/modules`)
            .set("Authorization", `Bearer ${tokenFixtures.instructorTwoToken}`)
            .send({
                courseId,
                name: "Test Module",
                description: "Module description",
            });
        expect(res.status).toBe(status.FORBIDDEN);
        expect(res.body.message).toBe("Access denied: Not the course instructor.");
    });

    test("Should not create a new module if not an instructor", async () => {
        await createUser(studentOne);
        const res = await request(app)
            .post(`/${courseId}/modules`)
            .set("Authorization", `Bearer ${tokenFixtures.studentOneToken}`)
            .send({
                courseId,
                name: "Test Module",
                description: "Module description",
            });
        expect(res.status).toBe(status.FORBIDDEN);
        expect(res.body.message).toBe("User is not an instructor.");
    });

    test("Should not create a new module if unauthenticated", async () => {
        const res = await request(app).post(`/${courseId}/modules`).send({
            courseId,
            name: "Test Module",
            description: "Module description",
        });
        expect(res.status).toBe(status.UNAUTHORIZED);
    });

    test("Should get all modules for a course", async () => {
        const res = await request(app).get(`/${courseId}/modules`);
        expect(res.status).toBe(status.OK);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("Should get a module by ID", async () => {
        const res = await request(app)
            .get(`/${courseId}/modules/${moduleId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(status.OK);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(moduleId);
    });

    test("Should update a module", async () => {
        const res = await request(app)
            .patch(`/${courseId}/modules/${moduleId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "Updated Module Name" });
        expect(res.status).toBe(status.OK);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Updated Module Name");
    });


    test("Should not update a module if not course instructor", async () => {
        const res = await request(app)
            .patch(`/${courseId}/modules/${moduleId}`)
            .set("Authorization", `Bearer ${tokenFixtures.instructorTwoToken}`)
            .send({ name: "Updated Module Name" });
        expect(res.status).toBe(status.FORBIDDEN);
    });


    test("Should delete a module", async () => {
        const res = await request(app)
            .delete(`/${courseId}/modules/${moduleId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(status.NO_CONTENT);
    });

    test("Should not delete a module if not course instructor", async () => {
        const res = await request(app)
            .delete(`/${courseId}/modules/${moduleId}`)
            .set("Authorization", `Bearer ${tokenFixtures.instructorTwoToken}`);
        expect(res.status).toBe(status.FORBIDDEN);
    });

});
