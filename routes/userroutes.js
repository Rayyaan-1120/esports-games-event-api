const express = require('express');
const usercontroller = require('../controller/usercontroller');
const authcontroller = require('../controller/authcontroller');

const userrouter = express.Router();

// userrouter.route('/').get(authcontroller.protectroutes, usercontroller.allusers).post(usercontroller.createuser)
// userrouter.route('/:id').get(usercontroller.singleuser).patch(usercontroller.updateuser).delete(usercontroller.deleteuser)

userrouter.get(
  '/me',
  authcontroller.protectroutes,
  usercontroller.getMe,
  usercontroller.getSingleuser
);
userrouter.patch(
  '/updateme',
  authcontroller.protectroutes,
  usercontroller.userphotoupdate,
  usercontroller.resizephoto,
  usercontroller.updateme
);
userrouter.delete(
  '/deleteme',
  authcontroller.protectroutes,
  usercontroller.deleteme
);
userrouter.delete(
  '/deleteuser',
  authcontroller.protectroutes,
  authcontroller.restrictTo('admin'),
  usercontroller.Admindeleteuser
);
userrouter.patch(
  '/updateuser',
  authcontroller.protectroutes,
  authcontroller.restrictTo('admin'),
  usercontroller.Adminupdateuser
);
userrouter.get(
  '/',
  authcontroller.protectroutes,
  authcontroller.restrictTo('admin'),
  usercontroller.allusers
);
userrouter.get(
  '/:id',
  authcontroller.protectroutes,
  authcontroller.restrictTo('admin'),
  usercontroller.getSingleuser
);

//authentication special routes

userrouter.post(['/signup',], authcontroller.Sendsignupemail); //working fine
userrouter.post('/signup/:confirmationcode', authcontroller.Signup); //working fine
userrouter.post('/login', authcontroller.Login); //working fine
userrouter.post('/forgotpassword', authcontroller.forgotpassword); //working fine
userrouter.patch('/resetpassword/:token', authcontroller.resetpassword); //working fine
userrouter.patch(
  '/updatemypassword',
  authcontroller.protectroutes,
  authcontroller.updatepassword
); //working fine

module.exports = userrouter;
