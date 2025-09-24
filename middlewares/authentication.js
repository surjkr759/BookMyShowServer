const userLib = require('../lib/user')
// const User = require('../models/user')

function authenticationMiddleware() {
    return function (req, res, next) {
        const authHeader = req.headers['Authorization'] || req.headers['authorization']

        if(authHeader) {
            const headerSplit = authHeader.split('Bearer ')
            if(headerSplit.length === 2) {
                const token = headerSplit[1]
                const validateTokenResult = userLib.validateToken(token)
                if(validateTokenResult) req.user = validateTokenResult
            }
        }

        next()
    }
}


function ensureAuthenticated(allowedRoles = null) {
    return async function(req, res, next) {
        const user = req.user

        //if user is null, user is not authenticated
        if(!user) return res.status(401).json({status: 'error', error: 'Not authenticated'})

        //if no allowedRoles is passed as an argument, all roles are allowed
        if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ status: 'error', error: 'Access denied' });
            }
        }
        return next()
    }
}

module.exports = { authenticationMiddleware, ensureAuthenticated }