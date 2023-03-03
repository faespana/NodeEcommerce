const { Router } = require('express');

const { check } = require('express-validator');

const {
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    findProductById,
} = require('../controllers/product.controllers');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const { validProductById } = require('../middlewares/product.middlewares');
const { validateFields } = require('../middlewares/validateField.middleware');
const {
    createProductValidation,
} = require('../middlewares/validations.middlewares');
const { upload } = require('../utils/multer');

const router = Router();

router.get('/', findProduct);

router.get('/:id', validProductById, findProductById);

router.use(protect);

router.post(
    '/',
    upload.array('productImgs', 3),
    createProductValidation,
    validateFields,
    restrictTo('admin'),
    createProduct
);

router.put('/', (req, res) => {
    res.json({
        status: 'sucess',
        message: 'ROUTE - PUT',
    });
});

router.patch('/:id', validProductById, restrictTo('admin'), updateProduct);

router.delete('/:id', validProductById, restrictTo('admin'), deleteProduct);

module.exports = {
    productRouter: router,
};
