const mongoose = require('mongoose')

const registerschema = new mongoose.Schema({
    game:{
        type:mongoose.Schema.ObjectId,
        ref:'Game', 
        required:[true,'registeration must belong to a gameevent']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User', 
        required:[true,'registeration must belong to a user']
    },
    price:{
        type:Number,
        required: [true, 'Registered Event price is mandatory']
    },
    registeredat:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:false
    }
})

registerschema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'Game',
        select:'name'
    })
})

const Register = mongoose.Model('Register',registerschema)

module.exports = Register