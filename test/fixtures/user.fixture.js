// const pool = require("../../src/db/init");
const { faker } = require("@faker-js/faker");
const pool = require("../../src/db/init");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");



const admin = {
    id: randomUUID(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isadmin: true,
};

const instructorOne = {
    id: randomUUID(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: true,
};

const instructorTwo = {
    id: randomUUID(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: true,
};

const studentOne = {
    id: randomUUID(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: false,
};

const studentTwo = {
    id: randomUUID(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: false,
};

const createUser = async(userDetails)=>{
    userDetails.password = await bcrypt.hash(userDetails.password, 10)
    const fields = Object.keys(userDetails)
    const values = Object.values(userDetails)
    const data = [];
    let index = 1
    values.forEach((value) => {
        data.push(`$${(value=index)}`);
        index++;
    });
    let profileId;
    const query = `INSERT INTO users(${fields.join(",")}) VALUES(${data.join(",")}) RETURNING id, email, firstname, lastname, isinstructor, isverified`;
    const result = await pool.query(query, values)
    if (result.rows[0].isinstructor) {
        const profile = await pool.query('INSERT INTO instructors("user") VALUES($1) RETURNING id', [result.rows[0].id]);
        profileId = profile.rows[0].id

    } else {
        const profile = await pool.query('INSERT INTO students("user") VALUES($1) RETURNING id', [result.rows[0].id]);
        profileId = profile.rows[0].id;
    }

    return result.rows[0], profileId
}



module.exports = {
    admin,
    instructorOne,
    instructorTwo,
    studentOne,
    studentTwo,
    createUser
}