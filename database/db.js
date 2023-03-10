const { Sequelize } = require('sequelize');

const db = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'e-commerceDB',
    logging: false,
});

module.exports = { db };
