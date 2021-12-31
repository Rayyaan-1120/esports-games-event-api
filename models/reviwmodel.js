const mongoose = require('mongoose')
const Game = require('./gamemodel')

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
    user:[
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


reviewmodel.index({game:1,user:1},{unique:true})
reviewmodel.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name photo email'
    })

    next()
})

//static methods on models

reviewmodel.statics.calcAverageRatings = async function(gameId) {
    console.log(gameId)
   const stats = await this.aggregate([
        {
            $match:{game:gameId}
        },
        {
            $group:{
                _id:'$game',
                nRating:{$sum:1},
                avgRating:{$avg:'$ratings'}
            }
        }
    ])

    console.log(stats)
    if(stats.length > 0){
        await Game.findByIdAndUpdate(gameId[0],{
            total_ratings:stats[0].nRating,
            ratings:stats[0].avgRating
        })
    }
}

reviewmodel.post('save', function(){

    this.constructor.calcAverageRatings(this.game)

})

//findbyidandupdate
//findbyidanddelete

reviewmodel.pre(/^findOneAnd/,async function(next){
    this.rev = await this.findOne()
    console.log(this.rev)
    next()
})

reviewmodel.post(/^findOneAnd/,async function(){
    // this.rev = await this.findOne()this wll not work because the query ha been executed
   await this.rev.constructor.calcAverageRatings(this.rev.game)
})


const Review = mongoose.model('Review',reviewmodel)

module.exports = Review