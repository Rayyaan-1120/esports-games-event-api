const Review = require('../models/reviwmodel')
const catchAsync = require('../util/catchAsync')
const factory = require('./handlerfactory')
const AppError = require('../util/apperrorclass')

exports.getallreviews = factory.getAll(Review)
exports.createReview = catchAsync(async (req, res,next) => {
    //allow nested routes 
    if(!req.body.game) req.body.game = req.params.gameId
    if(!req.body.user) req.body.user = req.user.id

    await Review.findOne({"user":req.user.id,"game":req.params.gameId},async function(err, review) {
        if(err) return next(new AppError(err,500))
        if(review){
            return next(new AppError('you canot pass more than one review',400))
        }else{
            const reviewcreate = await Review.create(req.body)
            res.status(200).json({
                status: 'success',
                data: {
                    reviewcreate,
                }
            });
        }
    })

  
})

exports.getsinglereview = factory.getOne(Review)
exports.deletereview = factory.deleteone(Review)
exports.updatereview = factory.updateone(Review)
