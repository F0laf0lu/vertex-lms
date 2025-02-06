const { faker } = require("@faker-js/faker");
const pool = require("../../src/db/init");
const { randomUUID } = require("crypto");

const courseOne = {
    name: faker.lorem.word(5),
    description: faker.lorem.sentence(),
    difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]), 
};

const courseTwo = {
    name: faker.lorem.word(5),
    description: faker.lorem.sentence(),
    difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
};

const invalidCourse = {
    id:randomUUID(),
    name: faker.lorem.word(5),
    description: faker.lorem.sentence(),
    difficulty: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
};

const createCourse = async(courseDetails)=>{
    const query = "INSERT INTO course(name, description, difficulty, instructor) VALUES($1, $2, $3, $4) RETURNING *"
    const values = [courseDetails.name, courseDetails.description, courseDetails.difficulty, courseDetails.instructor]
    const result = await pool.query(query, values)
    return result.rows[0]
}


module.exports = {
    createCourse,
    courseOne,
    courseTwo,
    invalidCourse
}