const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

exports.validUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findOne({
        where: {
            id,
            status: true,
        },
    });

    if (!user) {
        return next(new AppError('The user was not fount', 404));
    }

    req.user = user;

    next();
});

exports.validIfExistUserEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });

        if (user && user.status === false /*!user.status*/) {
            //TODO: Lo que se deberia hacer es hacerle un update a true al estado de la cuenta
            return res.status(400).json({
                status: 'error',
                message:
                    "The user has an account but it's desactivated please talk with the admin",
            });
        }
        if (user) {
            return res.status(400).json({
                status: 'error',
                message: "The email's user already exists",
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};
