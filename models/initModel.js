const Cart = require('./cart.model');
const Category = require('./category.model');
const Order = require('./order.model');
const Product = require('./product.model');
const ProductImg = require('./productImg');
const ProductInCart = require('./productInCart');
const User = require('./user.model');

const initModel = () => {
    //Relations
    User.hasMany(Product /*, { sourceKey: 'id', foreignKey: 'userId' }*/);
    Product.belongsTo(User /*, { sourceKey: 'id', foreignKey: 'userId' }*/);

    User.hasMany(Order);
    Order.belongsTo(User);

    User.hasOne(Cart);
    Cart.belongsTo(User);

    Product.hasMany(ProductImg);
    ProductImg.belongsTo(Product);

    Category.hasMany(Product);
    Product.belongsTo(Category);

    Cart.hasMany(ProductInCart);
    ProductInCart.belongsTo(Cart);

    Product.hasOne(ProductInCart);
    ProductInCart.belongsTo(Product);

    Cart.hasOne(Order);
    Order.belongsTo(Cart);
};

module.exports = initModel;
