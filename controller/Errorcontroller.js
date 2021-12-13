const AppError = require('../util/apperrorclass')

const handlecasterrordb = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleduplicatefielderrdb = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value with ${value} please enter valid values`
    return new AppError(message, 400)

}

const handlevalidationerrdb = err => {

    const errors = Object.values(err.errors).map(val => val.message)
    const message = `Invalid input data ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handlewebtokenerror = () => new AppError('Invalid token please login again', 401)

const handletokenexpireerror = () => new AppError('Your token has expired please login again', 401)

const senderrordev = (err, res) => {
    res.status(err.statusCode).json({
        name: err.name,
        status: err.status,
        message: err.message,
        stack: err.stack
    })
}

const senderrorprod = (err, res) => {

    if (err.isOperationalerror) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'something went wrong'
        })
    }


}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        senderrordev(err, res)
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        if (error === 'CastError') error = handlecasterrordb(error)
        if (error.code === 11000) error = handleduplicatefielderrdb(error)
        if (error.name === 'ValidationError') error = handlevalidationerrdb(error)
        if (error.name === 'JsonWebTokenError') error = handlewebtokenerror()
        if (error.name === 'TokenExpiredError') error = handletokenexpireerror()
        senderrorprod(error, res)
    }

}