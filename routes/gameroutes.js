const express = require('express');
const gamecontroller = require('../controller/gamecontroller');
const authcontroller = require('../controller/authcontroller');
const reviewscontroller = require('../controller/reviewscontroller');
const reviewroutes = require('./reviewroutes');

const gamesrouter = express.Router();

gamesrouter.use('/:gameId/reviews', reviewroutes);

gamesrouter
  .route('/distance/center/:latlng/unit/:unit')
  .get(gamecontroller.gamesdistance);

gamesrouter
  .route('/games-within/:distance/center/:latlng/unit/:unit')
  .get(gamecontroller.gameswithin);
//'games-competetions?distance=300&center=-40,45&unit=miles

//params middleware
// gamesrouter.param('id',gamecontroller.checkId)

//aggregation pipeline routes
gamesrouter.route('/games-stats').get(gamecontroller.getGamestats);
gamesrouter.route('/monthly-plans/:year').get(gamecontroller.getMonthlyplans);

//aliasing top rated competetions

gamesrouter
  .route('/top-rated')
  .get(gamecontroller.toprated, gamecontroller.getgames);

gamesrouter
  .route('/')
  .get(authcontroller.protectroutes, gamecontroller.getgames)
  .post(authcontroller.protectroutes, gamecontroller.creategame);
gamesrouter
  .route('/:id')
  .get(authcontroller.protectroutes, gamecontroller.getsinglegame)
  .patch(
    authcontroller.protectroutes,
    authcontroller.restrictTo('admin'),
    gamecontroller.uploadgameimages,
    gamecontroller.resizegameimages,
    gamecontroller.updategame
  )
  .delete(
    authcontroller.protectroutes,
    authcontroller.restrictTo('admin', 'moderator'),
    gamecontroller.deletegame
  );

//implementing nested routes

module.exports = gamesrouter;
