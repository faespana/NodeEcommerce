const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const ProductInCart = require('../models/productInCart');
const { ref, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');

exports.findUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll({
        where: {
            status: true,
        },
    });

    const usersPromises = users.map(async user => {
        const imgRef = ref(storage, user.profileImageUrl);
        const url = await getDownloadURL(imgRef);

        user.profileImageUrl = url;

        return user;
    });

    const userResolved = await Promise.all(usersPromises);

    res.status(200).json({
        status: 'success',
        message: 'The users were found successfully',
        users: userResolved,
    });
});

exports.findUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    const imgRef = ref(storage, user.profileImageUrl);

    const url = await getDownloadURL(imgRef);

    user.profileImageUrl = url;

    res.status(200).json({
        status: 'success',
        message: 'The user was found successfully',
        user,
        url,
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    const { username, email } = req.body;

    const updatedUser = await user.update({
        username,
        email,
    });

    res.status(200).json({
        status: 'success',
        message: 'The user has been updated successfully',
        updatedUser,
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    await user.update({ status: false });

    res.status(200).json({
        status: 'success',
        message: 'The user has been delated',
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    } //se puede tambien usar middlewares ya que se esta copiando este codigo desde authcontroller

    const salt = await bcrypt.genSalt(10);
    const encripterPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
        password: encripterPassword,
        passwordChangedAt: new Date(),
    });
    res.status(200).json({
        status: 'success',
        message: 'The user password was updated successfully',
    });
});

exports.getOrders = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const orders = await Order.findAll({
        where: {
            userId: sessionUser.id,
            status: true,
        },
        include: [
            {
                model: Cart,
                where: {
                    status: 'purchased',
                },
                include: [
                    {
                        model: ProductInCart,
                        where: {
                            status: 'purchased',
                        },
                    },
                ],
            },
        ],
    });

    res.status(200).json({
        orders,
    });
});

exports.getOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { sessionUser } = req;

    const order = await Order.findOne({
        where: {
            userId: sessionUser.id,
            id,
            status: true,
        },
        include: [
            {
                model: Cart,
                where: {
                    status: 'purchased',
                },
                include: [
                    {
                        model: ProductInCart,
                        where: {
                            status: 'purchased',
                        },
                    },
                ],
            },
        ],
    });

    res.status(200).json({
        order,
    });
});
