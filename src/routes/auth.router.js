const express = require('express')
const { register, login, confirmEmail, createAdmin } = require('../controllers/auth.controller')



const router = express.Router()

router.get('/admin', createAdmin)
router.post('/register', register) 
router.post('/login', login)
router.post('/verify-email', confirmEmail)



module.exports = router;


