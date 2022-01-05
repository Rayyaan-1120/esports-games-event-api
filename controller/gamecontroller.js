const Game = require('../models/gamemodel');
const catchAsync = require('../util/catchAsync')
const APIfeatures = require('../data/Apifeatures')
const AppError = require('../util/apperrorclass')
const factory = require('./handlerfactory')
const multer = require('multer')
const sharp = require('sharp')




const multerstorage = multer.memoryStorage()

const multerfilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('only images are allowed',400),false)
    }
}

const upload = multer({
    storage:multerstorage,
    fileFilter:multerfilter
})


exports.uploadgameimages = upload.fields([
    {name:'coverimage',maxCount:1},
    {name:'images',maxcount:3}
])

exports.resizegameimages = catchAsync(async (req,res,next) => {
    console.log(req.files.coverimage[0].buffer)

    if(!req.files.coverimage || !req.files.images) return next()


    req.body.coverimage = `game-${req.params.id}-${Date.now()}-cover.jpeg`
    
    await sharp(req.files.coverimage[0].buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`images/gamecoverimages/${req.body.coverimage}`)


    req.body.images = []

    await Promise.all(req.files.images.map(async(file,i) => {
        const filename = `game-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

    await sharp(file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`images/gameuploadedimages/${filename}`)

    req.body.images.push(filename)

    }))


    console.log(req.body.images)

    next()
})

//alaising top rated games tours
exports.toprated = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratings';
    next();
};

//getgames
exports.getgames = factory.getAll(Game);

//getsinglegame
exports.getsinglegame = factory.getOne(Game,'reviews')

//create a new game

exports.creategame = factory.createone(Game)

//updating a game

exports.updategame = factory.updateone(Game)

//deleting a game

exports.deletegame = factory.deleteone(Game)

//aggregation pipeline methods

exports.getGamestats = catchAsync(async (req, res) => {
    const stats = await Game.aggregate([
        {
            $match: { ratings: { $gte: 4 } },
        },
        {
            $group: {
                _id: '$difficulty',
                num: { $sum: 1 },
                sumReviews: { $sum: '$total_ratings' },
                avgRating: { $avg: '$ratings' },
                avgPrice: { $avg: '$entryprice' },
                minPrice: { $min: '$entryprice' },
                maxPrice: { $max: '$entryprice' },
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

//realtime business logic

exports.getMonthlyplans = catchAsync(async (req, res) => {

    const year = req.params.year * 1;
    console.log(year);
    console.log(new Date(`${year}-01-01`));
    console.log(new Date(`${year}-12-31`));

    const newstats = await Game.aggregate([
        {
            $unwind: '$start_dates',
        },
        {
            $match: {
                start_dates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$start_dates' },
                numGames: { $sum: 1 },
                games: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numGames: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            newstats,
        },
    });
});


//34.091840, -118.178312
exports.gameswithin = catchAsync(async(req,res,next) => {
    const {distance,latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',')

    if(!lat || !lng){
        return next(new AppError('please provide the corect in the format lat,lng',400))
    }

    console.log(lat,lng,distance,unit)

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const games = await Game.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}})

    res.status(200).json({
        status: 'success',
        results:games.length,

        data:{
            data:games
        }
    })
})

exports.gamesdistance = catchAsync(async(req,res,next) => {
    const {latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',')

    if(!lat || !lng){
        return next(new AppError('please provide the corect in the format lat,lng',400))
    }

    console.log(lat,lng,unit)


    const games = await Game.aggregate([
        {
            $geoNear:{
                near:{
                    typr:'Point',
                    coordinates:[lng * 1,lat * 1]
                },
                distanceField:'distance',
                distanceMultiplier:0.001
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])

    console.log(games)

    res.status(200).json({
        status: 'success',
        results:games.length,
        data:{
            data:games
        }
    })
})



//
// const readgames = JSON.parse(fs.readFileSync('./data/displaydata.json','utf-8'))

//params middleware function
// exports.checkId = (req,res,next,val) => {
//     if(req.params.id * 1 > readgames.length){
//         return res.status(404).json({
//             status:"fail",
//             message:"Invalid id"
//         })
//     }
//     next()
// }

// exports.checkBody = (req,res,next,val) => {
//   if(!req.body.name || !req.body.summary){
//       console.log(req.body)
//       return res.status(404).json({
//           status:'failed',
//           message:'name and price fields are required'
//       })
//   }
//    next()
// }


 //filtering
        // const gameobj = { ...req.query }
        // const excludedfields = ['page', 'limit', 'sort', 'fields']
        // excludedfields.forEach(el => delete gameobj[el])

        // //advanced filtering
        // let querystring = JSON.stringify(gameobj)
        // querystring = querystring.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        // let query = Game.find(JSON.parse(querystring))

        //sorting
        // if (req.query.sort) {
        //     const sortby = req.query.sort.split(',').join(' ')
        //     query = query.sort(sortby)
        // } else {
        //     query = query.sort('-createdAt')
        // }

        // //fieldslimiting
        // if (req.query.fields) {
        //     const reqfields = req.query.fields.split(',').join(' ')
        //     console.log(reqfields)
        //     query = query.select(reqfields)
        // } else {
        //     query = query.select('name summary coverimage entryprice ratings')

        // }

        //pagination

        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 2;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //   const noofgames = await Game.countDocuments();
        //   if (skip > noofgames) throw new Error('the page does not exist');
        // }
        //sending response

        // const allgames = await Game.find().where('name').equals('Dota-2').where('ratings').equals(4.1)
        // const allgames = await Game.find()