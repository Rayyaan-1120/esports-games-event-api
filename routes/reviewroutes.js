const express = require('express')
const reviewscontroller = require('../controller/reviewscontroller')
const authcontroller = require('../controller/authcontroller')

const reviewRouter = express.Router()


reviewRouter.route('/').get(reviewscontroller.getallreviews)
reviewRouter.route('/createreview').post(reviewscontroller.createReview)

module.exports = reviewRouter