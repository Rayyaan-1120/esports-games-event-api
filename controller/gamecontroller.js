const Game = require('../models/gamemodel');
const catchAsync = require('../util/catchAsync')
const APIfeatures = require('../data/Apifeatures')
const AppError = require('../util/apperrorclass')



//alaising top rated games tours
exports.toprated = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratings';
    next();
};

//getgames
exports.getgames = catchAsync(async (req, res, next) => {

    const features = new APIfeatures(Game.find(), req.query)
        .filter()
        .sorting()
        .fieldslimiting()
        .pagination();
    const allgames = await features.query;
    res.status(200).json({
        status: 'success',
        requestedat: req.requestTime,
        data: {
            allgames,
        },
    });


});

//getsinglegame
exports.getsinglegame = catchAsync(async (req, res, next) => {

    const Singlegame = await Game.findById(req.params.id);
    if (!Singlegame) {
       return next(new AppError('invalid id has been passed', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            Singlegame,
        },
    });
});

//create a new game

exports.creategame = catchAsync(async (req, res) => {
    const newgame = await Game.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newgame,
        },
    });
});

//updating a game

exports.updategame = catchAsync(async (req, res,next) => {
    const updatedgame = await Game.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedgame) {
        return next(new AppError('invalid id has been passed', 404))
     }
    res.status(200).json({
        status: 'success',
        data: {
            updatedgame,
        },
    });
});

//deleting a game

exports.deletegame = catchAsync(async (req, res,next) => {
    const deleted = await Game.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
        return next(new AppError('invalid id has been passed', 404))
     }

    res.status(204).json({
        status: 'success',
        data: null,
    });

});

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