const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// GET REQUESTS (SHOW PRODUCTS AND SEARCH FUNCTION) 

// 1) Get all Products
router.get("/all", productController.getAllProducts);

// 2) Get all available Products
router.get("/available", productController.getAvailableProducts);

// 3) Get all products by category
router.get("/category/:category", productController.getProductsByCategory);

// 4) Get all products by seller
router.get("/seller/:seller", productController.getProductsBySeller);

// 5) Get a single product by id
router.get("/single/:id", productController.getProductById);

// 6) Search Functionality
router.get("/search", productController.searchProduct);

// 7) Delete a product
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;