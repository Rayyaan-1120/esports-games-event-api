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
    registeredat:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:false
    }
})
registerschema.index({game:1,user:1})

registerschema.pre(/^find/,function(next){
    this.populate({
        path:'game',
        select:'name'
    }).populate({
        path:'user',
    })
    next()
})

const Register = mongoose.model('Register',registerschema)

module.exports = Register