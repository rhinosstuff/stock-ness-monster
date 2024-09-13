const sequelize = require('../config/connection');
const { Users, Customer, Order, Product, Category, OrderProduct } = require('../models');

const userData = require('./userData.json');
const customerData = require('./customerData.json');
const orderData = require('./orderData.json');
const productData = require('./productData.json');
const categoryData = require('./categoryData.json');
const orderProductData = require('./orderProductData.json');

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
    console.log('--- Database synced ---');

    // Seeding Category Data first
    const categories = await Category.bulkCreate(categoryData, {
        individualHooks: true,
        returning: true,
    });
    console.log('--- Categories seeded ---');

    // Seeding User Data
    const users = await Users.bulkCreate(userData, {
        individualHooks: true,
        returning: true,
    });
    console.log('--- Users seeded ---');

    // Seeding Product Data
    const products = await Product.bulkCreate(productData, {
        individualHooks: true,
        returning: true,
    });
    console.log('--- Products seeded ---');

    // Seeding Customer Data
    const customers = await Customer.bulkCreate(customerData.map(customer => ({
        ...customer,
        account_manager_id: users[Math.floor(Math.random() * users.length)].id,
    })), {
        individualHooks: true,
        returning: true,
    });
    console.log('--- Customers seeded ---');

    // Seeding Order Data
    const orders = await Order.bulkCreate(orderData, {
        individualHooks: true,
        returning: true,
    });
    console.log('--- Orders seeded ---');

    //seeding orderProduct Data
    const orderProducts = await OrderProduct.bulkCreate(orderProductData, {
        individualHooks: true,
        returning: true,
    })
    console.log('--- OrderProducts seeded ---');
    process.exit(0);
};

seedDatabase();
