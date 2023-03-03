const { check } = require('express-validator');

exports.createProductValidation = [
    check('title', 'The title must be mandatory').not().isEmpty(),
    check('description', 'The description must be mandatory').not().isEmpty(),
    check('quantity', 'The quantity must be mandatory').not().isEmpty(),
    check('quantity', 'The quantity must be a number').isNumeric(),
    check('price', 'The price must be mandatory').not().isEmpty(),
    check('price', 'The price must be a number').isNumeric(),
    check('categoryId', 'The categoryId must be mandatory').not().isEmpty(),
    check('categoryId', 'The categoryId must be a number').isNumeric(),
    check('userId', 'The userId must be mandatory').not().isEmpty(),
    check('userId', 'The userId must be a number').isNumeric(),
];
