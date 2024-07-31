const User = require('../models/user')
const lib = require('../lib/user')

const handleSignupRequest = async (req, res) => {
    const safeParseResult = lib.validateUserSignup(req.body)

    if(safeParseResult.error) {
        return res.status(400).json({ status: 'error', error: safeParseResult.error})
    }

    const { firstName, lastName, email, password, role } = safeParseResult.data

    try {
        const { hashedPassword, salt } = lib.generateHash(password)

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            salt,
            role: role || 'user'
        })

        //Generate JWT Token
        const token = lib.generateToken({_id: newUser._id.toString(), role: newUser.role})

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
    // const hashedPassword = crypto.createHmac('sha256', salt).update(password).digest('hex')
    const { hashedPassword } = lib.generateHash(password, salt)

    if(passwordInDb !== hashedPassword)
        return res.status(400).json({ status: 'error', message: 'Email or password mismatch'})

    //Generate JWT Token
    const token = lib.generateToken({_id: user._id.toString(), role: user.role})

    return res.status(200).json({ status: 'success', data: {_id: user._id, token: token}})
}


const handleGetUserProfile = async (req, res) => {
    const user = req.user

    if(!user) return res.json({ profile: null })

    const userInDb = await User.findById(user._id)

    return res.json({
        profile: {
            firstName: userInDb.firstName,
            lastName: userInDb.lastName,
            email: userInDb.email,
            role: userInDb.role,
        }
    })
}

module.exports = { handleSignupRequest, handleSigninRequest, handleGetUserProfile }