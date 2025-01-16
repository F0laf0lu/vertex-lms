const request = require("supertest");
const faker = require("faker");
const {status} = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../setupTestDB");
const ApiError = require("../../src/utils/ApiError");
const bcrypt = require("bcryptjs");


describe('Auth Routes', ()=>{
    setupTestDB()

    describe('POST /auth/register', ()=>{
        let newUser;
        beforeEach(()=>{
            newUser = {
                name: faker.name.findName()
            }
        });

    test('should return 201 and successfully register user if request data is ok', async() => { 
        const res = await request(app)
            .post("/auth/register")
            .send(newUser)
            .expect(httpStatus.CREATED);
        expect(res.body.user).not.toHaveProperty('password');
    })



    })


})