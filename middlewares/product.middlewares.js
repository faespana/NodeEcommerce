const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ProductImg = require('../models/productImg');
const ProductInCart = require('../models/productInCart');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findOne({
        where: {
            id,
            status: true,
        },
        include: [
            {
                model: ProductImg,
            },
        ],
    });

    if (!product) {
        return next(new AppError('The product was not found', 404));
    }

    req.product = product;

    next();
});

exports.validBodyProductById = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findOne({
        where: {
            id: productId,
            status: true,
        },
    });

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    req.product = product;
    next();
});

exports.validIfExistProductsInStock = catchAsync(async (req, res, next) => {
    const { product } = req;
    const { quantity } = req.body;

    if (product.quantity < quantity) {
        return next(
            AppError('There are not enaugh products in the stock', 400)
        );
    }
    next();
});

exports.validExistProductInStockForUpdate = catchAsync(
    async (req, res, next) => {
        const { product } = req;
        const { newQty } = req.body;

        if (newQty > product.quantity) {
            return next(
                new AppError('There are not enaugh products in the stock', 400)
            );
        }

        next();
    }
);

exports.validExistProductIdByParams = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findOne({
        where: {
            id: productId,
            status: true,
        },
    });

    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    next();
});

exports.validExistProductInCartByParamsForUpdate = catchAsync(
    async (req, res, next) => {
        const { sessionUser } = req;
        const { productId } = req.params;

        const cart = await Cart.findOne({
            where: {
                userId: sessionUser.id,
                status: 'active',
            },
        });

        const productInCart = await ProductInCart.findOne({
            where: {
                cartId: cart.id,
                productId,
                status: 'active',
            },
        });

        if (!productInCart) {
            return next(
                new AppError('The product does not exist in the cart', 400)
            );
        }

        req.productInCart = productInCart;

        next();
    }
);
