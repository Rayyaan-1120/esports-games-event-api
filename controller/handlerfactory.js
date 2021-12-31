const catchAsync = require('../util/catchAsync')
const AppError = require('../util/apperrorclass')
const APIfeatures = require('../data/Apifeatures')


exports.deleteone = (Model) => {
    return catchAsync(async (req, res,next) => {
        const deleteddoc = await Model.findByIdAndDelete(req.params.id);
        
        if (!deleteddoc) {
            return next(new AppError('no document available with this id', 404))
         }
    
        res.status(204).json({
            status: 'success',
            data: null,
        });
    
    })
}

exports.updateone = (Model) => {
    return catchAsync(async (req, res,next) => {
        const updateddoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updateddoc) {
            return next(new AppError('no doc available for this id', 404))
         }
        res.status(200).json({
            status: 'success',
            data: {
                data:updateddoc,
            },
        });
    });
}

exports.createone = (Model) => {
   return catchAsync(async (req, res) => {
        const newdoc = await Model.create(req.body);
    
        res.status(201).json({
            status: 'success',
            data: {
                data:newdoc,
            },
        });
    });
} 

exports.getOne = (Model,popoptions) => {
    return catchAsync(async (req, res, next) => {

        let query = Model.findById(req.params.id)
        if(popoptions) query = query.populate(popoptions)
        const doc = await query


        if (!doc) {
           return next(new AppError('no document found with this id', 404))
        }
    
        res.status(200).json({
            status: 'success',
            data: {
                data:doc,
            },
        });
    });
}


exports.getAll = (Model) => {
    return catchAsync(async (req, res, next) => {

        let filterobj = {}

        if(req.params.gameId) filterobj = {game:req.params.gameId}

        const features = new APIfeatures(Model.find(filterobj), req.query)
            .filter()
            .sorting()
            .fieldslimiting()
            .pagination();
        const alldocs = await features.query;
        res.status(200).json({
            status: 'success',
            requestedat: req.requestTime,
            data: {
                data:alldocs,
            },
        });
    
    
    })
}

