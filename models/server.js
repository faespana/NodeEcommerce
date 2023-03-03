const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const { authRouter } = require('../routes/auth.routes');
const { categoriesRouter } = require('../routes/category.routes');
const { db } = require('../database/db');
const { productRouter } = require('../routes/product.routes');
const { usersRouter } = require('../routes/user.routes');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/error.controller');
const User = require('./user.model');
const Product = require('./product.model');
const initModel = require('./initModel');
const { cartRouter } = require('../routes/cart.routes');

//1. Crear la clase

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4000;

        this.limiter = rateLimit({
            max: 100,
            windowMs: 60 * 60 * 1000,
            message:
                'Too many request from this IP, please try again in an hour',
        });

        this.paths = {
            user: '/api/v1/users',
            products: '/api/v1/products',
            category: '/api/v1/categories',
            auth: '/api/v1/auth',
            cart: '/api/v1/cart',
        };

        this.database();

        this.middlewares();

        this.routes();
    }

    middlewares() {
        this.app.use(helmet());

        this.app.use(xss());

        this.app.use(hpp());

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        }

        this.app.use('/api/v1', this.limiter);

        this.app.use(cors());
        this.app.use(express.json());
    }

    //Routes
    routes() {
        this.app.use(this.paths.products, productRouter);
        this.app.use(this.paths.user, usersRouter);
        this.app.use(this.paths.category, categoriesRouter);
        this.app.use(this.paths.cart, cartRouter);

        //Utilizar las rutas de autenticacion

        this.app.use(this.paths.auth, authRouter);

        // this.app.all('*', (req, res, next) => {
        //     res.status(404).json({
        //         status: 'error',
        //         message: `Can't find ${req.originalUrl} on this server`,
        //     });
        // });
        this.app.all('*', (req, res, next) => {
            return next(
                new AppError(`Can't find ${req.originalUrl} on this server`)
            );
        });
        this.app.use(globalErrorHandler);
    }

    database() {
        db.authenticate()
            .then(() => console.log('Database authenticated'))
            .catch(error => console.log(error));

        initModel();

        db.sync()
            .then(() => console.log('Database synced'))
            .catch(error => console.log(error));
    }

    //Metodos para escuchar solicitudes por el puerto
    listen() {
        this.app.listen(this.port, () => {
            console.log('Server is running on port', this.port);
        });
    }
}

//2. Exportamos el servidor

module.exports = Server;
