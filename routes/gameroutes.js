const express = require('express')
const gamecontroller = require('../controller/gamecontroller')
const authcontroller = require('../controller/authcontroller')
const reviewscontroller = require('../controller/reviewscontroller')



const gamesrouter = express.Router()



//params middleware
// gamesrouter.param('id',gamecontroller.checkId)

//aggregation pipeline routes
gamesrouter.route('/games-stats').get(gamecontroller.getGamestats)
gamesrouter.route('/monthly-plans/:year').get(gamecontroller.getMonthlyplans)

//aliasing top rated competetions

gamesrouter.route('/top-rated').get(gamecontroller.toprated, gamecontroller.getgames)

gamesrouter.route('/').get(authcontroller.protectroutes,gamecontroller.getgames).post(authcontroller.protectroutes,gamecontroller.creategame)
gamesrouter.route('/:id').get(authcontroller.protectroutes,gamecontroller.getsinglegame).patch(authcontroller.protectroutes,gamecontroller.updategame).delete(authcontroller.protectroutes, authcontroller.restrictTo('admin', 'moderator'), gamecontroller.deletegame)

gamesrouter.route('/:tourId/reviews').post(reviewscontroller.createReview)

module.exports = gamesrouter