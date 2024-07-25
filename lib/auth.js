const JWT = require('jsonwebtoken')

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const generateToken = (data) => {
    const payload = JSON.stringify(data)
    const token = JWT.sign(payload, JWT_SECRET_KEY)
    return token
}

module.exports = { generateToken }