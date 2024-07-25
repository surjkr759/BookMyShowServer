const crypto = require('crypto')
const User = require('../models/user')
const lib = require('../lib/user')
const JWT = require('../lib/auth')

const handleSignupRequest = async (req, res) => {
    const safeParseResult = lib.validateUserSignup(req.body)

    if(safeParseResult.error) {
        return res.status(400).json({ status: 'error', error: safeParseResult.error})
    }

    const { firstName, lastName, email, password } = safeParseResult.data

    try {
        const { hashedPasword, salt } = lib.generateHash(password)

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPasword,
            salt
        })

        //Generate JWT Token
        const token = JWT.generateToken({_id: newUser._id, role: newUser.role})

        return res.status(200).json({ status: 'success', data: {_id: newUser._id, token: token}})

    } catch (err) {
        if(err.code === 11000)
            return res.status(400).json({status: 'error', message: 'Email already exists'})
        return res.status(500).json({status: 'error', message: 'Internal Server Error'})
    }
}


const handleSigninRequest = async (req, res) => {
    const safeParseResult = lib.validateUserSignIn(req.body)

    if(safeParseResult.error)
        return res.status(400).json({ status: 'error', error: safeParseResult.error})

    const { email, password } = safeParseResult.data

    const user = await User.findOne({ email })

    if(!user)
        return res.status(400).json({ status: 'error', message: 'Email does not exist'})
    const salt = user.salt
    const passwordInDb = user.password
    const hashedPasword = crypto.createHmac('sha256', salt).update(password).digest('hex')

    if(passwordInDb !== hashedPasword)
        return res.status(400).json({ status: 'error', message: 'Email or password mismatch'})

    //Generate JWT Token
    const token = JWT.generateToken({_id: user._id, role: user.role})

    return res.status(200).json({ status: 'success', data: {_id: user._id, token: token}})
}

module.exports = { handleSignupRequest, handleSigninRequest }