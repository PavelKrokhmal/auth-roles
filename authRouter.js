const Router = require('express')
const controller = require('./authController.js')
const {check} = require('express-validator')
const authMiddleware = require('./middleware/authMiddleware.js')
const roleMiddleware = require('./middleware/roleMiddleware.js')

const router = new Router()

router.post('/registration', [
    check('username', 'username can`t be empty').notEmpty(),
    check('password', 'password must be more than 4 symbols and less than 16 symbols').isLength({min: 4, max: 16})
], controller.registration)
router.post('/login', controller.login)
router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), controller.getUsers)

module.exports = router