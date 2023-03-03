const Category = require('../models/category.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

const findCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'status'] },
        where: {
            status: true,
        },
        include: [
            {
                model: Product,
                attributes: [
                    'id',
                    'title',
                    'description',
                    'quantity',
                    'price',
                    'categoryId',
                    'userId',
                ],
                where: {
                    status: true,
                },
                //required: false para traer categorias con ningun producto en stock
                // include: [
                //     {
                //         model: User,
                //         attributes: ['id', 'username', 'email', 'role'],
                //     },
                // ], esto se realizó, porque indirectamente se relacionan category y user, debido al userId
            },
        ],
    });
    res.status(200).json({
        status: 'success',
        message: 'The categories were found successfully',
        categories,
    });
});

const findCategory = catchAsync(async (req, res, next) => {
    const { category } = req;

    res.status(200).json({
        status: 'success',
        message: 'The category was found successfully',
        category,
    });
});

const createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    const newCategory = await Category.create({
        name,
    });

    res.status(201).json({
        status: 'success',
        message: 'The category was created successfully',
        newCategory,
    });
});

const updateCategory = catchAsync(
    async (req, res, next /*es obligacion el uso del next*/) => {
        const { category } = req;

        const { name } = req.body;

        const updatedCategory = await category.update({
            name,
        });
        res.status(200).json({
            status: 'success',
            message: 'The category has been updated successfully',
            updatedCategory,
        });
    }
);

const deleteCategory = catchAsync(async (req, res, next) => {
    const { category } = req;

    await category.update({ status: false });

    res.status(200).json({
        status: 'success',
        message: 'The category has been delated',
    });
});

module.exports = {
    findCategories,
    findCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};
