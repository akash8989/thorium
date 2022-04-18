const express = require("express");
const router = express.Router();

//===========IMPORT Controller==========================
const userController = require('../controllers/Usercontroller');
const productController=require("../controllers/productController")
const cartController=require("../Controllers/cartController")
const orderController=require("../Controllers/orderController")
const moddilewares=require("../middlewares/auth")


// User APIs
router.post('/User',userController.registerUser)
router.post('/login', userController.login)
router.get('/user/:userId/profile', moddilewares.Auth, userController.GetUsers)
router.put('/user/:userId/profile', moddilewares.Auth, userController.update)

// Product APIs
router.post('/products', productController.CreateProduct)
router.get('/products', productController.GetProducts)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.update)
router.delete('/products/:productId', productController.productDel)

// cart
router.post('/users/:userId/cart', moddilewares.Auth, cartController.createCart)
router.put('/users/:userId/cart', moddilewares.Auth, cartController.updateCart)
router.get('/users/:userId/cart', moddilewares.Auth, cartController.getCart)
router.delete('/users/:userId/cart', moddilewares.Auth, cartController.deleteCart)

// Order APIs
router.post('/users/:userId/orders', moddilewares.Auth, orderController.createOrder)
router.put('/users/:userId/orders', moddilewares.Auth, orderController.updateOrder)

module.exports=router