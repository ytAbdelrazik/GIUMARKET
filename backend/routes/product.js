const express = require('express');
const router = express.Router();
const productController = require("../controllers/product");
const authMiddleware = require("../middleware/authMiddleware"); // Updated import for auth middleware
const adminOnly = require("../middleware/adminOnly.js");
const Product = require("../models/product");

// GET REQUESTS (SHOW PRODUCTS AND SEARCH FUNCTION) 

// 1) Get all Products (Admin only)
router.get("/all", authMiddleware, adminOnly, productController.getAllProducts);

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
router.get("/search", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy } = req.query;

    // Build query object
    let query = {};
    if (q) {
      query.$text = { $search: q };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sort = {};
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    }

    // Execute query
    const products = await Product.find(query).sort(sort);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST REQUEST (ADD NEW PRODUCT)

// 7) Create a new product
//Tested-Working
router.post("/create", productController.createProduct);

// PUT REQUEST (UPDATE PRODUCT)

// 8) Update product
//Tested-Working
router.put("/update/:id", authMiddleware, productController.updateProduct);

// DELETE REQUEST (DELETE PRODUCT)

// 9) Delete a product (Owner or Admin)
router.delete("/delete/:id", authMiddleware, productController.deleteProduct);

module.exports = router;