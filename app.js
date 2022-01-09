const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const AppError = require('./util/apperrorclass')
const Globalerrormiddleware = require('./controller/Errorcontroller')
const gamesrouter = require('./routes/gameroutes')
const userrouter = require('./routes/userroutes')
const reviewRouter = require('./routes/reviewroutes')
const registerrouter = require('./routes/registerroutes')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const app = express()



////////////////
//middlewares
////////////////////////
//third party middlewares

//security http headers setting middleware
app.use(helmet())

const imagedir = require('path').join(__dirname, '/images')

app.use(express.static(imagedir))


if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}


//rate limiting with express rate limit to prevent multiple request from the same ip
// const limiter = rateLimit({
//     max:100,
//     windowMs:60 * 60 * 1000,
//     message:'Too many request from this IP, please try again in an hour'
// })

// app.use('/api',limiter)c

//body parser,reading data from body into req.body

app.use(express.json({limit:'15kb'}))
app.use(cookieParser())

//data sanitization for nosql sanitization

app.use(mongoSanitize())

//data sanitization for xss

app.use(xss())

app.use(hpp({
    whitelist:'entryprice'
}))


////////////////////////
// app.use((req,res,next) => {
//     console.log('hello middleware')
//     next()
// })
// app.use((req,res,next) => {
//     req.requestTime = new Date().toISOString()
//     next()
// })
//////////////////

app.use('/api/v1/games-competetions',gamesrouter)
app.use('/api/v1/users',userrouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/register',registerrouter)

//unhandled route handler
app.all('*',(req,res,next) => {

    next(new AppError(`Cant find the ${req.originalUrl} on the server`,404))

})

//error handling with express //error handling middleware

app.use(Globalerrormiddleware)

module.exports = app