const { Router } = require('express');

const { check } = require('express-validator');

const {
    findUsers,
    findUser,
    updateUser,
    deleteUser,
    updatePassword,
    getOrders,
    getOrder,
} = require('../controllers/user.controllers');
const {
    protect,
    protectAccountOwner,
} = require('../middlewares/auth.middlewares');
const { validUserById } = require('../middlewares/user.middlewares');
const { validateFields } = require('../middlewares/validateField.middleware');

const router = Router();

router.get('/', findUsers);

router.get('/orders', protect, getOrders);

router.get("/orders/:id", protect, getOrder)

router.get('/:id', validUserById, findUser);

router.use(protect);

router.patch(
    '/:id',
    [
        check('username', 'The username must be mandatory').not().isEmpty(),
        check('email', 'The email must be mandatory').not().isEmpty(),
        check('email', 'The email must be a correct format').isEmail(),
    ],
    validateFields,
    validUserById,
    protectAccountOwner,
    updateUser
);

router.patch(
    '/password/:id',
    [
        check('currentPassword', 'The current password must be mandatory')
            .not()
            .isEmpty(),
        check('newPassword', 'The new password must be mandatory')
            .not()
            .isEmpty(),
        validateFields,
        validUserById,
        protectAccountOwner,
    ],
    updatePassword
);

router.delete('/:id', validUserById, protectAccountOwner, deleteUser);

module.exports = {
    usersRouter: router,
};
