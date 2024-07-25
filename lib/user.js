const crypto = require('crypto')
const {z} = require('zod')
const {v4: uuidv4} = require('uuid')

function validateUserSignup(data) {
    const schema = z.object({
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3)
    })
    return schema.safeParse(data)
}

function validateUserSignIn(data) {
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(3)
    })
    return schema.safeParse(data)
}

function generateHash(password) {
    const salt = uuidv4()
    const hashedPasword = crypto.createHmac('sha256', salt).update(password).digest('hex')
    return { hashedPasword, salt }
}

module.exports = { validateUserSignup, validateUserSignIn, generateHash }