const express = require('express')
const { getAllUsers, manageUser } = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth')



const router = express.Router()

router.get('/', authMiddleware, manageUser)



module.exports = router