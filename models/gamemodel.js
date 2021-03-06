const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./Usermodel')



/////schema

const gameschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'the name is required!!!'],
        unique: true,
        trim: true,
        //validators
        maxlength:[25,'the name should be less than 25 characters'],
        minlength:[5,'the name should be greater than 5 characters']

    },
    entryprice: {
        type: Number,
        required: [true, 'the price is required!!!']
    },
    ratings: {
        type: Number,
        default: 4,
        //validators
        min:[1,'the ratings should be greater than 1'],
        max:[5,'the ratings should be less than 5'],
        set:val => Math.round(val * 10) /10
    },
    total_ratings: {
        type: Number,
        default: 0
    },
    Max_Squad_Members: {
        type: Number,
        required: [true, 'Max members is required']
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Summary is required']

    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    coverimage: {
        type: String,
        // required: [true, 'Description is required']
    },
    images: {
        type: [String],
        // required: [true, 'Images are required'],

    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    Totalrounds: {
        type: Number,
        required: [true, 'Rounds are required are required'],

    },
    start_dates: [Date],
    difficulty: {
        type: String,
        required: [true, 'difficulty are required'],
        //validators
        enum:{
            values:['Easy','Normal','Hard','Insane'],
            message:'difficulties can only be these four'
        }
    },
    slug:{
        type:String,
    },
    specialgames:{
        type:Boolean,
        default:false
    },
    discountprice:{
        type:Number,
        validate:{

            //this only points to the currentdoc when you are creating a new doc not on updating a doc
            validator:function(val){
              return val < this.entryprice
            },
            message:'the discount price should be less than actual price'
        }
    },
    winningPrice:{
        type:[Number],
        required:[true,'winning prices are required']
    },
    startLocation:{
        //geoJson
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
              },
              coordinates:[Number],
              address:String,
              description:String,
              dates:Date
        }
    ],
    totalseats:{
      type:Number,
      required:[true,'please definr the total number of seats'],
    },
    registerations:[
      {
          type:mongoose.Schema.ObjectId,
          ref:'User', 
          required:[true,'registeration must belong to a user'],
          validate:{
              validator:function(val){
                return  val.length <= this.totalseats
              },
              message:'all seats are reserved please wait until the next event happens'
          }
      }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    seatsbooked:{
        type:Number,
        default:0
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
)

//index reading 

gameschema.index({entryprice:1})
gameschema.index({slug:1})
gameschema.index({startLocation:'2dsphere'})


// document middleware : runs on create command and save command not on insert may command


//this is for embedding documents only works well with save not update

// gameschema.pre('save',async function(next){
//     const guides = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guides)
//     next()
// })

//virtual populate

gameschema.virtual('reviews',{
    ref:'Review',
    foreignField:'game',
    localField:'_id'
})


//type pre
gameschema.pre('save', function (next) {
    this.slug = slugify(this.name,{lower:true})
    next()
})

//type post

gameschema.post('save',(next,doc) => {
    console.log(doc)
    next()
})


/////////////////

//query middleware

// eslint-disable-next-line
gameschema.pre(/^find/,function(next){
    this.find({specialgames: {$ne:true}}) //this points to the query
    next()
})

gameschema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v'
    })
    next()
})

gameschema.pre('findOne',function(next){
    this.populate({
        path:'registerations'
    })
    next()
})

gameschema.pre('aggregate',function(next){
    console.log(this.pipeline())
    next()
})

//aggregation piplelines middleware
// eslint-disable-next-line
// gameschema.pre('aggregate',function(next){
//     console.log(this.pipeline())
//    this.pipeline().unshift({$match:{specialgames:{$ne:true}}})
//    next()
// })




const Game = mongoose.model('Game', gameschema)


module.exports = Game



//creating docs with mongoose
// testgame.save().then(doc => {
//     console.log(doc)
// }).catch(err => console.log(err))

// const testgame = new Game({
//     name:"fifa 25",
//     price:50,
//     rating:4.3
// })