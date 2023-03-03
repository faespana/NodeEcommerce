const Product = require('../models/product.model');
const catchAsync = require('../utils/catchAsync');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const ProductImg = require('../models/productImg');

findProduct = catchAsync(async (req, res, next) => {
    const products = await Product.findAll({
        where: {
            status: true,
        },
        include: [
            {
                model: ProductImg,
            },
        ],
    });

    const productPromises = products.map(async product => {
        const productImgsPromises = product.productImgs.map(
            async productImg => {
                const imgRef = ref(storage, productImg.imgUrl);
                const url = await getDownloadURL(imgRef);

                productImg.imgUrl = url;
                return productImg;
            }
        );
        await Promise.all(productImgsPromises);
    });

    await Promise.all(productPromises);

    res.status(200).json({
        status: 'success',
        message: 'The products were found successfully',
        products,
    });
});

findProductById = catchAsync(async (req, res, next) => {
    const { product } = req;

    const productImgsPromises = product.productImgs.map(async productImg => {
        const imgRef = ref(storage, productImg.imgUrl);
        const url = await getDownloadURL(imgRef);

        productImg.imgUrl = url;
        return productImg;
    });

    await Promise.all(productImgsPromises);

    return res.status(200).json({
        status: 'success',
        message: 'The product was found successfully',
        product,
    });
});

createProduct = catchAsync(async (req, res, next) => {
    const { title, description, quantity, categoryId, userId, price } =
        req.body; //evita que el front mande propiedades que esten de mas

    const newProduct = await Product.create({
        //Sacado del product model
        title: title.toLowerCase(),
        description: description.toLowerCase(),
        quantity,
        categoryId,
        userId,
        price,
    });

    const productImgsPromises = req.files.map(async file => {
        const imgRef = ref(
            storage,
            `products/${Date.now()} - ${file.originalname}`
        );

        const imgUploaded = await uploadBytes(imgRef, file.buffer);

        return await ProductImg.create({
            imgUrl: imgUploaded.metadata.fullPath,
            productId: newProduct.id,
        });
    });

    await Promise.all(productImgsPromises);

    res.status(201).json({
        status: 'success',
        message: 'The product was created successfully',
        newProduct,
    });
});

updateProduct = catchAsync(async (req, res, next) => {
    const { product } = req;

    const { title, description, price, quantity } = req.body;

    const updatedProduct = await product.update({
        title,
        description,
        quantity,
        price,
    });

    res.status(200).json({
        status: 'sucess',
        message: 'The product has been updated successfully',
        updatedProduct,
    });
});

deleteProduct = catchAsync(async (req, res, next) => {
    const { product } = req;

    await product.update({ status: false });

    //await product.destroy()

    res.status(200).json({
        status: 'sucess',
        message: 'The product has been delated',
    });
});

//Existen dos formas de exportar

module.exports = {
    findProduct,
    findProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
