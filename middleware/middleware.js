export function ensureAuthenicated (req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/auth/login')
}

export function attachUser (req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    req.user = req.user
    next()
}

export function errorHandler (err, req, res, next) {
    res.status(500).json({ err: err.toString() })
}