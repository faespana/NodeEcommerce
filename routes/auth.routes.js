const { Router } = require('express');
const { check } = require('express-validator');
const { createUser, login } = require('../controllers/auth.controller');
const { validIfExistUserEmail } = require('../middlewares/user.middlewares');
const { validateFields } = require('../middlewares/validateField.middleware');
const { upload } = require('../utils/multer');

const router = Router();

router.post(
    '/signup',
    [
        upload.single("profileImageUrl"),
        check('username', 'The username must be mandatory').not().isEmpty(),
        check('email', 'The email must be mandatory').not().isEmpty(),
        check('email', 'The email must be a correct format').isEmail(),
        check('password', 'The password must be mandatory').not().isEmpty(),
        // check('password', 'The password must be a correct format').isLength({
        //     max: 8,
        //     min: 4,
        // }),
    ],
    validateFields,
    validIfExistUserEmail,
    createUser
);

router.post(
    '/login',
    [
        check('email', 'The email must be a correct format').isEmail(),
        check('email', 'The email must be mandatory').not().isEmpty(),
        check('password', 'The password must be mandatory').not().isEmpty(),
        validateFields,
    ],
    login
);

module.exports = {
    authRouter: router,
};
