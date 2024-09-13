const router = require('express').Router();
const { Customer, Users, Order, Product, Category, Report, OrderProduct } = require('../models');
const withAuth = require('../utils/auth');
const { getLatestReport, getAllReports } = require('../generateReport');

// Route to home page
router.get('/', withAuth, async (req, res) => {
    try {
        const userId = req.session.user_id;
        const result = await Users.findByPk(userId, {
            attributes: ['first_name'],
        });
        
        // gets access to logged in first name to display on homepage
        const firstName = result.first_name;

        res.render('homepage', {
            logged_in: req.session.logged_in, firstName: firstName,
        });
    } catch (err) {
        res.status(500).json(err);
    };
});

// Route to login page
router.get('/login', async (req, res) => {
    try {
        res.render('login', {
            logged_in: req.session.logged_in,
        })
    } catch (err) {
        res.status(500).json(err);
    };
});

// Route to get the latest report
router.get('/report', withAuth, async (req, res) => {
    try {
      const report = await getLatestReport();
      if (report) {
        res.render('report', { 
            logged_in: req.session.logged_in,
            report: report.data });
      } else {
        res.status(500).send('Error generating report');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  // Route to view all reports
  router.get('/allreports', withAuth, async (req, res) => {
    try {
      const reports = await getAllReports();
      res.render('allreports', {
        logged_in: req.session.logged_in,
        reports: reports.map(report => {
          return {
            timestamp: report.timestamp,
            users: report.data.users,
            customers: report.data.customers,
            orders: report.data.orders,
            products: report.data.products
          };
        })
      });
    } catch (err) {
      res.status(500).json(err);
    }
  });

// Route to products page
router.get('/products', withAuth, async (req, res) => {
    try {
        const productData = await Product.findAll({ include: [{ model: Category }], order: [['item_name', 'ASC']] });
        const products = productData.map(product => product.toJSON());

        const categoryData = await Category.findAll();
        const categories = categoryData.map(category => category.toJSON());
  
        res.render('products', { products: products, categories: categories,
            logged_in: req.session.logged_in,
        })
     
    } catch (err) {
        res.status(500).json(err);
    };
});

// Route to categories page
router.get('/categories', withAuth, async (req, res) => {
  try {
      const categoryData = await Category.findAll({ include: [{ model: Product }], order: [['name', 'ASC']] });
      const categories = categoryData.map(category => category.toJSON());

      const productData = await Product.findAll();
      const products = productData.map(product => product.toJSON());

      res.render('categories', { categories: categories, products: products,
          logged_in: req.session.logged_in,
      })
  } catch (err) {
      res.status(500).json(err);
  };
});

// Route to order page
router.get('/orders', withAuth, async (req, res) => {
    try {
        const data = await Order.findAll({
            include: [
                { model : Customer },
                { model : Product,
                    through: {
                        model: OrderProduct,
                    },
                 },
            ],
            //sort by id so oldest orders created first appear higher on list
            order: [
                ['id', 'ASC']
            ]
        });
        const orderData = data.map(order => order.get({ plain: true }));

        const products = await Product.findAll({
            include: [
                {   model: Category, },
            ],

        });
        const productData = products.map(order => order.get({ plain: true }));

        const users = await Users.findAll({
            attributes: ['id', 'first_name', 'last_name'],
        })
        const userData = users.map(order => order.get({ plain: true }));

        const customers = await Customer.findAll({
            attributes: ['id','company_name'],
        })
        const customerData = customers.map(customer => customer.get({ plain: true }));

        res.render('orders', {
            orderData: orderData, productData: productData, userData: userData, customerData: customerData, logged_in: req.session.logged_in,
        })
    } catch (err) {
        res.status(500).json(err);
    };
});

// Route to customers page
router.get('/customers', withAuth, async (req, res) => {
    try {
        //retrieve all customer data as well as associated user, order, and product data
        const data = await Customer.findAll({
            include: [
                {
                    model: Users,

                },
                {
                    model: Order,
                    include: [{ model: Product }],
                },
            ],
            //sort customer alphabetically by company name
            order: [
                ['company_name', 'ASC']
            ]
        });
        const customerData = data.map(customer => customer.get({ plain: true }));

        const users = await Users.findAll({
            attributes: ['id', 'first_name', 'last_name'],
        })
        const userData = users.map(user => user.get({ plain: true }));

        res.render('customers', {
            customerData: customerData, userData: userData, logged_in: req.session.logged_in,
        });
    } catch (err) {
        res.status(500).json(err);
    };
});

//Route to users page
router.get('/users', withAuth, async (req, res) => {
    try {
        const data = await Users.findAll({
            include: [
                {
                    model: Customer,
                },
            ],
            //sorts users alphabetically by last name
            order: [
                ['last_name', 'ASC']
            ]
        });
        const userData = data.map(user => {
            const serializedUser = user.get({ plain: true });
            if (serializedUser.Customer) {
                serializedUser.Customer = serializedUser.Customer.map(customer => customer.get({ plain: true }));
            }
            return serializedUser;
        })

        res.render('users', {
            userData: userData, logged_in: req.session.logged_in,
        });
        console.log(userData);
    } catch (error) {
        res.status(500).json(error);
    };
});


module.exports = router;