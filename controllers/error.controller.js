const AppError = require('../utils/appError');

const handleCastError22P02 = () => {
    message = 'Some type of data sent does not match was expected';
    return new AppError(message, 400);
}; //funcion completa

const handleJWTError = () =>
    new AppError('Invalid token, please login again', 401); //funcion corta

const handleJWTExpireError = () =>
    new AppError('Your token has expired, please login again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack, //(en produccion no se deberia hacer ya que el frontend no le interesa estos errores)para ver los errores que aparecen en el clg dentro del postman
    });
};

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        //Programming or other unknown error: dont leak error details
        console.log('ERROR', err);
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong',
        });
    }
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'fail';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (!error.parent?.code) {
            error = err;
        }

        if (error.parent?.code === '22P02') {
            error = handleCastError22P02(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTExpireError(error);
        }

        sendErrorProd(error, res);
    }
};

module.exports = globalErrorHandler;
