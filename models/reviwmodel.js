const mongoose = require('mongoose')

const reviewmodel = new mongoose.Schema({
    reviewtext:{
      type:String,
      required:[true,'review text is required'],
    },
    ratings:{
        type: Number,
        min:1,
        max:5,
        required:[true,'rating is required']
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    game:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'Game',
            required:[true,'a review must belong to a game']
        }
    ],
    User:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'a review must belong to a user']
        }
    ],
   
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
)

//query middleware function

reviewmodel.pre(/^find/,function(next){
    this.populate({
        path:'User',
        select:'name photo'
    })

    next()
})

const Review = mongoose.model('Review',reviewmodel)

module.exports = Review