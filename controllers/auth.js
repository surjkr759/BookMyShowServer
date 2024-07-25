const User = require('../models/user')

const handleSignupRequest = async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    try {
        const { hashedPasword, salt } = generatePassword(password)

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPasword,
            salt: salt
        })

        return res.status(200).json({ status: 'success', data: newUser._id})

    } catch (err) {
        return res.status(500).json({status: 'error', message: err.message})
    }
}

module.exports = { handleSignupRequest }