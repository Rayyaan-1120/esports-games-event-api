const User = require('../models/Usermodel');
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/apperrorclass')


//users api

const filterobj = (obj, ...allowfields) => {

    const newObj = {}

    Object.keys(obj).forEach(el => {
        if(allowfields.includes(el)) newObj[el] = obj[el]
    })

    return newObj
}

exports.allusers = catchAsync(async (req, res) => {
    const allusers = await User.find();
    res.status(200).json({
        status: 'success',
        requestedat: req.requestTime,
        results: allusers.length,
        data: {
            allusers,
        },
    });
})

exports.updateme = catchAsync(async (req,res,next) => {
    //create an error if the user tries to update a password

    if(req.body.password || req.body.passwordconfirm){
        return next(new AppError('you cannot changed the password from here',400))
    }

//filtered out notallowed fields
    const filteredbody = filterobj(req.body,'name','email')
    //update the user document
    const updateduser = await User.findByIdAndUpdate(req.user.id,filteredbody,{new:true,runValidators:true})

    res.status(200).json({
        status:'success',
        data:{
            user:updateduser
        }
    })
} )

exports.deleteme = catchAsync(async (req,res) => {
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:'success',
        data:null
    })
})

// exports.createuser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'users not added'
//     })
// }

// exports.singleuser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'users not added'
//     })
// }
// exports.updateuser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'users not added'
//     })
// }
// exports.deleteuser = (req, res) => {

//     res.status(500).json({
//         status: 'error',
//         message: 'users not added'
//     })
// }


