const crypto = require('crypto')
const JWT = require('jsonwebtoken')
const {z} = require('zod')
const {v4: uuidv4} = require('uuid')

const userTokenSchema = z.object({
    _id: z.string(),
    role: z.string()
})

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

if(!JWT_SECRET_KEY) throw new Error('JWT Secret Key is required!')

function validateUserSignup(data) {
    const schema = z.object({
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
        role: z.enum(['admin', 'user']).optional()
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

function generateHash(password, salt = uuidv4()) {
    const hashedPassword = crypto.createHmac('sha256', salt).update(password).digest('hex')
    return { hashedPassword, salt }
}

const generateToken = (data) => {
    const safeParseResult = userTokenSchema.safeParse(data)

    if(safeParseResult.error) throw new Error(safeParseResult.error)
    const payload = JSON.stringify(safeParseResult.data)
    const token = JWT.sign(payload, JWT_SECRET_KEY)
    return token
}


const validateToken = (token) => {
    try {
        const payload = JWT.verify(token, JWT_SECRET_KEY)

        const safeParseResult = userTokenSchema.safeParse(payload)

        if(safeParseResult.error) throw new Error(safeParseResult.error)

        return safeParseResult.data
    } catch(err) {
        return null
    }
    
}

module.exports = { validateUserSignup, validateUserSignIn, generateHash, generateToken, validateToken }