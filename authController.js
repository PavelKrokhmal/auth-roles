const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')

const User = require('./models/User.js')
const Role = require('./models/Role.js')

const generateAccessToken = (id, roles) => {
    const payload = {
        id, 
        roles
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '24h'})
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Error during registration', errors})
            }

            const {username, password} = req.body
            const candidate = await User.findOne({username})

            if (candidate) {
                return res.status(400).json({message: 'User has already exists'})
            }

            const userRole = await Role.findOne({value: 'USER'})

            const hashedPassword = bcrypt.hashSync(password, 4)
            const user = new User({username, password: hashedPassword, roles: [userRole.value]})

            await user.save()

            return res.json({message: 'User has registered succesfully!'})

        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body

            const user = await User.findOne({username})

            if (!user) {
                return res.status(400).json({message: 'User was not found'})
            }

            const validPassword = bcrypt.compareSync(password, user.password)

            if (!validPassword) {
                return res.status(400).json({message: 'Incorrect password'})
            }

            const token = generateAccessToken(user._id, user.roles)

            return res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find()
            res.json({users})
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new authController()