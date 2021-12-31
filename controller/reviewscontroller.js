const Review = require('../models/reviwmodel')
const catchAsync = require('../util/catchAsync')
const factory = require('./handlerfactory')

exports.getallreviews = factory.getAll(Review)
exports.createReview = catchAsync(async (req, res) => {
    //allow nested routes 
    if(!req.body.game) req.body.game = req.params.gameId
    if(!req.body.user) req.body.user = req.user.id
    const reviewcreate = await Review.create(req.body)
    res.status(200).json({
        status: 'success',
        data: {
            reviewcreate,
        }
    });
})

exports.getsinglereview = factory.getOne(Review)
exports.deletereview = factory.deleteone(Review)
exports.updatereview = factory.updateone(Review)
