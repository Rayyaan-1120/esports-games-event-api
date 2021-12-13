const express = require('express')
const gamecontroller = require('../controller/gamecontroller')
const authcontroller = require('../controller/authcontroller')



const gamesrouter = express.Router()



//params middleware
// gamesrouter.param('id',gamecontroller.checkId)

//aggregation pipeline routes
gamesrouter.route('/games-stats').get(gamecontroller.getGamestats)
gamesrouter.route('/monthly-plans/:year').get(gamecontroller.getMonthlyplans)

//aliasing top rated competetions

gamesrouter.route('/top-rated').get(gamecontroller.toprated, gamecontroller.getgames)

gamesrouter.route('/').get(authcontroller.protectroutes, gamecontroller.getgames).post(gamecontroller.creategame)
gamesrouter.route('/:id').get(gamecontroller.getsinglegame).patch(gamecontroller.updategame).delete(authcontroller.protectroutes, authcontroller.restrictTo('admin', 'moderator'), gamecontroller.deletegame)

module.exports = gamesrouter