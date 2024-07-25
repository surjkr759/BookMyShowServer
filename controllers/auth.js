const User = require('../models/user')
const lib = require('../lib/user')

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
        
        return res.status(200).json({ status: 'success', data: {_id: newUser._id}})

    } catch (err) {
        if(err.code === 11000)
            return res.status(400).json({status: 'error', message: 'Email already exists'})
        return res.status(500).json({status: 'error', message: 'Internal Server Error'})
    }
}

module.exports = { handleSignupRequest }