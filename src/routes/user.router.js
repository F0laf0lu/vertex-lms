const express = require('express')
const { getAllUsers, manageUser } = require('../controllers/user.controller')
const {authMiddleware, isadmin} = require('../middlewares/auth')



const router = express.Router()

router.get("/", authMiddleware, isadmin, getAllUsers)
router.get("/:userId", authMiddleware, manageUser)



module.exports = router