const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const Userschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'username is required'],
        unique: true,
        trim: true,
        minlength: [6, 'username must be greater than 6 characters'],
        maxlength: [20, 'username must be lower than 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'useremail is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        // required: [true, 'photo is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [8, 'password must be greater than 8 characters'],
        maxlength: [20, 'password must be lower than 20 characters'],
        unique: true,
        select: false
    },
    confirmpassword: {
        type: String,
        required: [true, 'Confirmation of password is required'],
        validate: {
            //works only on for save and create
            validator: function (val) {
                return val === this.password
            },
            message: 'the passwords do not match please try again'
        }
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'contributor', 'admin'],
        default: 'user',
    },
    passwordChange:{
        type:Date,
        select:false
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    verified:{
        type:Boolean,
        default:false,
        select:false
    },
    confirmationcode:{
        type:Number,
        select:false
    }

})

//pre middleware works between passing the data and saving the data to database

Userschema.pre('save', async function (next) {
    //only run when the password is modified
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    this.confirmpassword = undefined

    next()
})

Userschema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChange = Date.now() - 1000

    next()
})

//querymiddleware

Userschema.pre('find',function(next){
    this.find({active:{$ne:false}})
    next()
})

//instance methods 

//in instance methods this keyword marks to the current document

Userschema.methods.correctPassword = async function (candidatepassword, userpassword) {
    return await bcrypt.compare(candidatepassword, userpassword)
}

Userschema.methods.changedPasswordAfter = function (jwttimestamp) {
    // converting time in seconds

    
    if (this.passwordChange) {
        const passwordchangetimestamp = parseInt(this.passwordChange.getTime() / 1000, 10)
        return jwttimestamp < passwordchangetimestamp
    }

    //false means not changed password
    return false
}

Userschema.methods.createPasswordResetToken = function () {

    //crypting reset token
    const resetToken = crypto.randomBytes(32).toString('hex')

    //comparing userschema passwordresettoken field with hashed token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log({ resetToken }, this.passwordResetToken)

    //setting expirytoken field
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000


    //returning reset token which is sent to the user through email

    return resetToken


}


const User = mongoose.model('User', Userschema)

module.exports = User