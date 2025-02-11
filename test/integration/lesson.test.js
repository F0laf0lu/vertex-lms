const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/db/init");
const {
    admin,
    instructorOne,
    createUser,
    studentOne,
    instructorTwo,
} = require("../fixtures/user.fixture");
const tokenFixtures = require("../fixtures/token.fixture");
const courseFixtures = require("../fixtures/course.fixtures");


beforeAll(async () => {
    await pool.query("DELETE FROM lessons");
    await pool.query("DELETE FROM module");
});

describe("Lesson API Tests", () => {
    let courseId;
    let moduleId;
    let lessonId;
    let authToken;

    beforeAll(async () => {
        const userData = await createUser(instructorOne);
        courseFixtures.courseOne.instructor = userData.profileId;
        const course = await courseFixtures.createCourse(courseFixtures.courseOne);
        courseId = course.id;
        authToken = tokenFixtures.instructorOneToken;
        const moduleRes = await pool.query(
            "INSERT INTO module (name, course, description) VALUES ($1, $2, $3) RETURNING id",
            ["Test Module", courseId, "New module"]
        );
        moduleId = moduleRes.rows[0].id;
    });

    test("Create a lesson", async () => {
        const res = await request(app)
            .post(`/${courseId}/modules/${moduleId}/lessons`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                name: "Lesson 1",
                lessontext: "This is a test lesson",
                duration: 10,
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        lessonId = res.body.data.id;
    });

    test("Get all lessons for a module", async () => {
        const res = await request(app).get(`/${courseId}/modules/${moduleId}/lessons`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Get a single lesson", async () => {
        const res = await request(app).get(`/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(lessonId);
    });

    test("Update a lesson", async () => {
        const res = await request(app)
            .patch(`/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "Updated Lesson Name" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Updated Lesson Name");
    });

    test("Delete a lesson", async () => {
        const res = await request(app)
            .delete(`/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("Get non-existent lesson should return 404", async () => {
        const res = await request(app).get(`/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        expect(res.status).toBe(404);
    });
});

afterAll(async () => {
    await pool.end();
});
