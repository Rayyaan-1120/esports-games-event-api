const express = require('express')
const usercontroller = require('../controller/usercontroller')
const authcontroller = require('../controller/authcontroller')




const userrouter = express.Router()
// userrouter.route('/').get(authcontroller.protectroutes, usercontroller.allusers).post(usercontroller.createuser)
// userrouter.route('/:id').get(usercontroller.singleuser).patch(usercontroller.updateuser).delete(usercontroller.deleteuser)

userrouter.patch('/updateme',authcontroller.protectroutes,usercontroller.updateme)
userrouter.delete('/deleteme',authcontroller.protectroutes,usercontroller.deleteme)

//authentication special routes

userrouter.post('/signup', authcontroller.Signup)
userrouter.post('/login', authcontroller.Login)
userrouter.post('/forgotpassword', authcontroller.forgotpassword)
userrouter.patch('/resetpassword/:token', authcontroller.resetpassword)
userrouter.patch('/updatemypassword', authcontroller.protectroutes, authcontroller.updatepassword)

module.exports = userrouter
