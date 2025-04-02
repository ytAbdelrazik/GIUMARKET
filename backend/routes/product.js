const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// GET REQUESTS (SHOW PRODUCTS AND SEARCH FUNCTION) 

// 1) Get all Products
//Tested-Working
router.get("/all", productController.getAllProducts);

// 2) Get all available Products
//Tested-Working
router.get("/available", productController.getAvailableProducts);

// 3) Get all products by category
//Tested-Working
router.get("/category/:category", productController.getProductsByCategory);

// 4) Get all products by seller
//Tested-Working
router.get("/seller/:seller", productController.getProductsBySeller);

// 5) Get a single product by id
//Tested-Working
router.get("/single/:id", productController.getProductById);

// 6) Search Functionality
router.get("/search", productController.searchProduct);

// POST REQUEST (ADD NEW PRODUCT)

// 7) Create a new product
//Tested-Working
router.post("/create", productController.createProduct);

// PUT REQUEST (UPDATE PRODUCT)

// 8) Update product
//Tested-Working
router.put("/update/:id", productController.updateProduct);

// DELETE REQUEST (DELETE PRODUCT)

// 9) Delete a product
//Tested-Working
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;