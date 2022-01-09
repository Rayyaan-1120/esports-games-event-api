const Register = require('../models/registermodel')
const factory = require('./handlerfactory')
const catchAsync = require('../util/catchAsync')
const Game = require('../models/gamemodel')
const AppError = require('../util/apperrorclass')
const mongoose = require('mongoose')

//delete a single resgisteration
exports.getallregisterations = factory.getAll(Register)

exports.deleteRegisteration = factory.deleteone(Register)

exports.getoneRegisteration = factory.getOne(Register)

exports.updateoneregisteration = factory.updateone(Register)


exports.createRegisteration = catchAsync(async(req,res,next) => {
    const {gameId,userId} = req.params
    if(!gameId || !userId){
        return next(new AppError('please provide the valid gameid and userid to make a registeration'))
    }

   await Register.findOne({"user":userId},async function(err,doc){
       if(err) return next(new AppError(err,500))
       if(doc){
           return next(new AppError('you have already registered in this competetion',400))
       }else{
        const registeration = await Register.create({game:gameId,user:userId})
        await Game.findOneAndUpdate({"_id":gameId},{"$push":{"registerations":userId}})
     
        res.status(200).json({
            status: 'success',
            data:{
                registeration
            }
        })
       }
   })
  
})
