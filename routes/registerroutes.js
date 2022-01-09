const express = require('express')
const authcontroller = require('../controller/authcontroller')
const registercontroller = require('../controller/resgistercontroller')

const registerrouter = express.Router()

registerrouter.route('/').get(registercontroller.getallregisterations)
registerrouter.route('/:gameId/:userId').post(authcontroller.protectroutes,authcontroller.restrictTo('user'),registercontroller.createRegisteration)


module.exports = registerrouter