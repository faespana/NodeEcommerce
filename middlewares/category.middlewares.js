const Category = require('../models/category.model');
const catchAsync = require('../utils/catchAsync');

exports.validCategoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findOne({
        where: {
            id,
            status: true,
        },
    });

    if (!category) {
        return next(new AppError('The category was not fount', 404));
    }

    req.category = category;
    next();
});
