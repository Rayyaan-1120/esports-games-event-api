const User = require('../models/Usermodel');
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/apperrorclass')
const factory = require('./handlerfactory')
const multer = require('multer')
const sharp = require('sharp')


//users api

// const multerstorage = multer.diskStorage({
//     destination:(req,file,cb) => {
//         cb(null,'images/user')
//     },
//     filename:(req,file,cb) => {
//         const ext = file.mimetype.split('/')[1]
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerstorage = multer.memoryStorage()

const multerfilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('only images are allowed',400),false)
    }
}

const upload = multer({
    storage:multerstorage,
    fileFilter:multerfilter
})

exports.userphotoupdate = upload.single('photo')

exports.resizephoto = (req,res,next) => {
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`images/user/${req.file.filename}`)

    next()
}


const filterobj = (obj, ...allowfields) => {

    const newObj = {}

    //looping over the object and setting the allowfileds value to the newobj
    Object.keys(obj).forEach(el => {
        if(allowfields.includes(el)) newObj[el] = obj[el]
    })

    console.log(newObj)

    return newObj
}

exports.getMe = (req, res,next) => {
    req.params.id = req.user.id
    next()
}


exports.updateme = catchAsync(async (req,res,next) => {
    //create an error if the user tries to update a password


    if(req.body.password || req.body.passwordconfirm){
        return next(new AppError('you cannot changed the password from here',400))
    }

//filtered out notallowed fields
    const filteredbody = filterobj(req.body,'name','email')
    if(req.file) filteredbody.photo = req.file.filename
    //update the user document
    const updateduser = await User.findByIdAndUpdate(req.user.id,filteredbody,{new:true,runValidators:true})
    console.log(updateduser)

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



exports.allusers = factory.getAll(User)

exports.getSingleuser = factory.getOne(User)

exports.Adminupdateuser = factory.updateone(User)

exports.Admindeleteuser = factory.deleteone(User)


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


