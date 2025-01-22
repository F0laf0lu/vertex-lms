// const pool = require("../../src/db/init");
const { faker } = require("@faker-js/faker");
const pool = require("../../src/db/init");
const bcrypt = require("bcryptjs");



const admin = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isadmin: true,
};

const instructorOne = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: true,
};

const instructorTwo = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: true,
};

const studentOne = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: "securepassword123",
    isinstructor: false,
};

const studentTwo = {
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
    const query = `INSERT INTO users(${fields.join(",")}) VALUES(${data.join(",")}) RETURNING id, email, firstname, lastname, isinstructor, isverified`;
    const result = await pool.query(query, values)
    if (result.rows[0].isinstructor) {
        await pool.query('INSERT INTO instructors("user") VALUES($1)', [result.rows[0].id]);
    } else {
        await pool.query('INSERT INTO students("user") VALUES($1)', [result.rows[0].id]);
    }

    return result.rows[0]
}



module.exports = {
    admin,
    instructorOne,
    instructorTwo,
    studentOne,
    studentTwo,
    createUser
}