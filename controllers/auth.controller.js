const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ref, uploadBytes } = require('firebase/storage');
const { storage } = require('../utils/firebase');

exports.createUser = async (req, res) => {
    try {
        // console.table(req.body)
        // console.log(req.file)

        // res.json({
        //     status: "success"
        // })
        const { username, email, password, role = 'user' } = req.body;

        const imgRef = ref(
            storage,
            `users/${Date.now()}-${req.file.originalname}`
        );

        const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

        //creando una instancia
        const newUser = new User({
            username,
            email,
            password,
            role,
            profileImageUrl: imgUploaded.metadata.fullPath,
        });

        //Encriptando las contrasenas
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        //Guardar en la base de datos
        await newUser.save();

        const token = await generateJWT(newUser.id);

        res.status(201).json({
            status: 'success',
            message: 'The user was created successfully',
            token,
            newUser: {
                id: newUser.id,
                username: newUser.username,
                email,
                role: newUser.role,
                profileImageUrl: newUser.profileImageUrl,
            },
        });
    } catch (error) {
        console.log(error);

        /*Especificando errores pero no muy utilizado*/
        // if (error.parent.code === "22P02") {
        //     return res.status(400).json({
        //         status: "error",
        //         message: "Invalid Datatype in your request"
        //     })
        // }

        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1. Verificar si existe el usuario y si el password es correcto

    const newUser = await User.findOne({
        where: {
            email: email.toLowerCase(),
            status: true,
        },
    });

    if (!newUser) {
        return next(new AppError('The user could not be found', 404));
    }

    if (!(await bcrypt.compare(password, newUser.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    console.log(newUser);
    //2. Si todo esta bien voy a enviar un token al cliente

    const token = await generateJWT(newUser.id);

    res.status(200).json({
        status: 'success',
        token,
        newUser: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        },
    });
});
