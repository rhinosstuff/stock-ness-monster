const Customer = require('./Customer');
const Order = require('./Order');
const Product = require('./Product');
const Users = require('./Users');
const Category = require('./category');
const Report = require('./Report'); 
const OrderProduct = require('./OrderProduct');

//Order and Product
Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: 'order_id',
});

Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: 'product_id',
});

//Customer and Order
Customer.hasMany(Order, {
    foreignKey: 'customer_id',
});

Order.belongsTo(Customer, {
    foreignKey: 'customer_id',
});

// User and Customer
Users.hasMany(Customer, {
    foreignKey: 'account_manager_id',
});

Customer.belongsTo(Users, {
    foreignKey: 'account_manager_id',
});

// Category and Product

Category.hasMany(Product, {
    foreignKey: 'category_id',
    onDelete: 'CASCADE',
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
});

module.exports = { Users, Order, Product, Customer, Category, Report, OrderProduct };