const { z } = require('zod')

const validateNewTheatreCreation = (data) => {
    const schema = z.object({
        theatreName: z.string().min(1),
        location: z.object({
            lat: z.string().min(1),
            lon: z.string().min(1),
            city: z.string().min(1),
            address: z.string().min(1),
        }),
        isActive: z.string().optional()
    })
    return schema.safeParse(data)
}

module.exports = { validateNewTheatreCreation }