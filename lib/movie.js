const {z} = require('zod')

const validateCreateMovieInputs = (data) => {
    const schema = z.object({
        title: z.string(),
        description: z.string(),
        language: z.string()
    })

    return schema.safeParse(data)
} 

module.exports = { validateCreateMovieInputs }