const Review = require('../models/reviwmodel')
const catchAsync = require('../util/catchAsync')

exports.getallreviews = catchAsync(async (req,res) => {

     const allReviews = await Review.find()
     res.status(200).json({
        status: 'success',
        requestedat: req.requestTime,
        results: allReviews.length,
        data: {
            allReviews,
        }
    });

})

exports.createReview = catchAsync(async (req, res) => {
    const reviewcreate = await Review.create(req.body)
    res.status(200).json({
        status: 'success',
        data: {
            reviewcreate,
        }
    });
})