const Product = require("../models/product.js");

// SHOW PRODUCTS

/* 
    THE METHODS FOR THE SHOW PRODUCTS ARE:
    1) Get all Products 
    2) Get all available Products
    3) Get all products by category
    4) Get all products by seller
    5) Get a single product by id
    6) Search Functionality
    7) Delete a product
*/

/*
    NOTES: 

    1)We are still yet to decide whether the default view should include both available and out of stock products.
    If that is not the case, we can let the "Get all Products" method be restricted only to Admins, while general users can only see the available products.
    
    2)We can also make a method for getting all 'out of stock' products explicitly for Admins to use.

    3)We will decide later about how the default view should like, should the products listed be sorted by a certain attribute (Creation date, Price etc.)

    4)We can add sorting/filtering options for the products. (Sorting by price, Creation date, etc.) We can implement this by adding the sorting attribute
    as a query paramter to the request.

    5)We will decide the search criteria later, whether it should be based on the product name only or both name and description.

*/

// Get all Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all available Products
const getAvailableProducts = async (req, res) => {
  try {
    const availableProducts = await Product.find({ availability: true });
    res.json(availableProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products by seller
const getProductsBySeller = async (req, res) => {
  try {
    const { seller } = req.params;
    const products = await Product.find({ seller });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single product by id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search function
const searchProduct = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      const products = await Product.find();
      return res.json(products);
    }

    const products = await Product.find({
      $or: [{ name: { $regex: q, $options: "i" } }],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, price, category, quantity, condition, seller, description, images } = req.body;

    // Create a new product instance
    const newProduct = new Product({
      name,
      price,
      category,
      quantity,
      condition,
      seller,
      description,
      images,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Return the created product
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    // Find the product by id and update the specified fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, description },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the updated product
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Only allow owner or admin
    if (String(product.seller) !== String(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  }catch (error) {
    res.status(500).json({ message: "Server error" });
  }};


// Flag a product (for admin use)
const flagProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.flags += 1;
    await product.save();

    res.json({ message: "Product flagged successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

// Export all functions
module.exports = {
  getAllProducts,
  getAvailableProducts,
  getProductsByCategory,
  getProductsBySeller,
  getProductById,
  searchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  flagProduct
};
