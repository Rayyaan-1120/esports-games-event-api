const express = require('express')
const reviewscontroller = require('../controller/reviewscontroller')
const authcontroller = require('../controller/authcontroller')

const reviewRouter = express.Router({mergeParams:true})


reviewRouter.route('/').get(reviewscontroller.getallreviews).post(authcontroller.protectroutes, authcontroller.restrictTo('user'),reviewscontroller.createReview)
// reviewRouter.route('/createreview').post(reviewscontroller.createReview)
reviewRouter.route('/:id').delete(authcontroller.protectroutes,authcontroller.restrictTo('user','admin'), reviewscontroller.deletereview).patch(authcontroller.protectroutes,authcontroller.restrictTo('user','admin'),reviewscontroller.updatereview).get(reviewscontroller.getsinglereview)

module.exports = reviewRouter