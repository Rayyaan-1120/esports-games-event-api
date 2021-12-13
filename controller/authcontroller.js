const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const User = require('../models/Usermodel')
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/apperrorclass')
const sendEmail = require('../util/email')

const signtokenjwt = id => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
})

const createsendtoken = (user,statuscode,res) => {

    const cookieoptions = {
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV === 'production') cookieoptions.secure = true
    const token = signtokenjwt(user._id)

    res.cookie('jwt',token,cookieoptions)

    user.password = undefined

    res.status(statuscode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

exports.Signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        // passwordChange: req.body.passwordChange,
        role: req.body.role
    })


    createsendtoken(newUser,200,res)

    
})

exports.Login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body

    //if emaails and passwords already exits
    if (!email || !password) {
        return next(new AppError('please provide emaail and password', 400))
    }

    //check if user exits and the password is correct
    const loggedinuser = await User.findOne({ email }).select('+password')
    if (!loggedinuser || !await loggedinuser.correctPassword(password, loggedinuser.password)) {
        return next(new AppError('incorrect email or password', 401))
    }

    //if everything is ok then send jw to client

    createsendtoken(loggedinuser,200,res)
})

exports.protectroutes = catchAsync(async (req, res, next) => {

    let token;
    //check if the token is present there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // eslint-disable-next-line prefer-destructuring
        token = req.headers.authorization.split(' ')[1]
    }

    //check if the token is verified (verification)

    if (!token) {
        return next(new AppError('you are not logged in Please login to continue', 401))
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //check if user still exists

    const Currentuser = await User.findById(decoded.id)
    if (!Currentuser) {
        next(new AppError('the user belonging to the id is not valid', 401))
    }
    //check if user changed password after the token was issued
    console.log(decoded.iat)
    console.log(decoded.id)

    // if (Currentuser.changedPasswordAfter(decoded.iat)) {
    //     return next(new AppError('you have recently changed the password please login again'))
    // }

    //storing whole data of user to Currentusr
    req.user = Currentuser

    //grant to the protected routed
    next()
})

//restricting users according to their roles (admin,users)

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
    //roles is an array [admin,moderator] //likewise 
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you are not allowed to do this act this is restricted only for admins!!!', 401))
        }

        next()
    }
}

//forgot password functionality 

exports.forgotpassword = catchAsync(async (req, res, next) => {

    //get user based on current email

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('there is no user with that email', 404))
    }

    //generate the random token

    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    //sent email to reset password
    const reseturl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`

    const message = `forgot you password? send a request with your new password and confirmpassword
    to this url ${reseturl}\n if you donot forgot your psssword please ignore this mail`

    try {
        await sendEmail({
            email: user.email,
            subject: 'your rest password token (valid for 10 mins only)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'token has been sent to this email'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new AppError('your request has been faild please try again later', 500))

    }


})

//reset password functionality

exports.resetpassword = catchAsync(async (req, res, next) => {

    //get user based on the token
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken: hashedtoken, passwordResetExpire: { $gt: Date.now() } })
    console.log(user)

    //if token is not expired and the user exists,setiing a new password
    if (!user) {
        return next(new AppError('user does not exists or the resettoken has been expired', 400))
    }

    user.password = req.body.password
    user.confirmpassword = req.body.confirmpassword
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()

    //update the chngedpasswordat property of the user

    //log the user in again with jwt

    createsendtoken(user,200,res)

})

exports.updatepassword = catchAsync(async (req, res, next) => {
    //Get the user from the collection
    const user = await User.findById(req.user.id).select('+password')
    console.log(user)
    //check if the posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('your current password is wrong', 401))
    }
    //if the password is correct than update the password

    //User.findbyidandupdate()will not work
    //only use (save) for updating the passwords
    user.password = req.body.password
    user.confirmpassword = req.body.confirmpassword
    await user.save()

    //login the user again by sending jwt
    createsendtoken(user,200,res)
   
})


