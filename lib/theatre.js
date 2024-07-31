const { z } = require('zod')

const validateNewTheatreCreation = (data) => {
    const schema = z.object({
        theatreName: z.string(),
        location: z.object({
            lat: z.string(),
            lon: z.string(),
            address: z.string()
        }),
        isActive: z.string().optional()
    })
    return schema.safeParse(data)
}

module.exports = { validateNewTheatreCreation }