const Register = require('../models/registermodel')
const factory = require('./handlerfactory')
const catchAsync = require('../util/catchAsync')

//delete a single resgisteration

exports.deleteRegisteration = factory.deleteone(Register)

exports.getoneRegisteration = factory.getOne(Register)

exports.updateoneregisteration = factory.updateone(Register)

exports.getallregisterations = factory.getAll(Register)

exports.createRegisteration = catchAsync(async(req,res,next) => {
    const {game,user,price} = req.query
})
