const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const ProductInCart = require('../models/productInCart');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.addProductToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const { cart } = req;

    const productInCart = await ProductInCart.create({
        cartId: cart.id,
        productId,
        quantity,
    });

    res.status(201).json({
        status: 'success',
        message: 'The product has been added',
        productInCart,
    });
});

exports.updateCart = catchAsync(async (req, res, next) => {
    const { newQty } = req.body;
    const { productInCart } = req;

    if (newQty < 0) {
        return next(new AppError('The quantity must be greater than 0', 400));
    }

    if (newQty === 0) {
        await productInCart.update({ quantity: newQty, status: 'removed' });
    } else {
        await productInCart.update({ quantity: newQty, status: 'active' });
    }

    res.status(201).json({
        status: 'success',
        message: 'The product in cart has been updated',
    });
});

exports.removeProductToCart = catchAsync(async (req, res, next) => {
    const { productInCart } = req;

    await productInCart.update({ quantity: 0, status: 'removed' });

    res.status(200).json({
        status: 'success',
        message: 'The product in cart has been removed',
    });
});

exports.buyProductOnCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    //1 Buscar el carrito del usuario

    const cart = await Cart.findOne({
        attributes: ['id', 'userId'],
        where: {
            userId: sessionUser.id,
            status: 'active',
        },
        include: [
            {
                model: ProductInCart,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: {
                    status: 'active',
                },
                include: [
                    {
                        model: Product,
                        attributes: {
                            exclude: ['status', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
            },
        ],
    });

    if (!cart) {
        return next(new AppError('Thereare not products in cart', 400));
    }

    //2 Calcular el precio total a pagar
    let totalPrice = 0;

    cart.productInCarts.forEach(productInCart => {
        totalPrice += productInCart.quantity * productInCart.product.price;
    });

    //3 Vamos a actualizar el stock del modelo product (Porque aca utilizo el map y no el foreach?)

    const purchasedProductPromise = cart.productInCarts.map(
        async productInCart => {
            const product = await Product.findOne({
                where: {
                    id: productInCart.productId,
                },
            });
            //Calcular la cantidad de productos que me quedan en la tienda
            //Se debe verificar cantidad para no agregar mas
            const newStock = product.quantity - productInCart.quantity;
            //Actualizar la informacion y retornarla
            return await product.update({ quantity: newStock });
        }
    );

    await Promise.all(purchasedProductPromise);

    const statusProductInCartPromises = cart.productInCarts.map(
        async productInCart => {
            const productInCartFoundIt = await ProductInCart.findOne({
                where: {
                    id: productInCart.id,
                    status: 'active',
                },
            });
            return await productInCartFoundIt.update({ status: 'purchased' });
        }
    );

    await Promise.all(statusProductInCartPromises);

    await cart.update({ status: 'purchased' });

    const order = await Order.create({
        userId: sessionUser.id,
        cartId: cart.id,
        totalPrice,
    });

    res.status(201).json({
        message: 'The order has been generated successfully',
        order,
    });
});
