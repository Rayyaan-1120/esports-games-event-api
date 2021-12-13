const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')




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
        required: [true, 'Description is required']
    },
    images: {
        type: [String],
        required: [true, 'Images are required'],

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
    }
})


//document middleware : runs on create command and save command not on insert may command


//type pre
gameschema.pre('save', function (next) {
    this.slug = slugify(this.name,{lower:true})
    next()
})

//type post

// gameschema.post('save',(next,doc) => {
//     console.log(doc)
//     next()
// })


/////////////////

//query middleware

// eslint-disable-next-line
gameschema.pre(/^find/,function(next){
    this.find({specialgames: {$ne:true}}) //this points to the query
    next()
})

//aggregation piplelines middleware
// eslint-disable-next-line
gameschema.pre('aggregate',function(next){
    console.log(this.pipeline())
   this.pipeline().unshift({$match:{specialgames:{$ne:true}}})
   next()
})



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