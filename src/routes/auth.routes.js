const express = require('express')
const { register } = require('../controllers/auth.controller')



const router = express.Router()

// router.get('/', register)

router.post('/register', register)
router.post('/login', register)
// router.post('/login')



module.exports = router;