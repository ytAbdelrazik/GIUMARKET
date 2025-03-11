const Product = require('../models/product.js');



// SHOW PRODUCTS

/* 
    THE METHODS FOR THE SHOW PRODUCTS ARE:
    1) Get all Products 
    2) Get all available Products
    3) Get all products by category
    4) Get all products by seller
    5) Get a single product by id
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

// 1) Get all Products 

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// 2) Get all available Products

exports.getAvailableProducts = async (req, res) => {
    try{
        const availableProducts = await Product.find({availability: true});
        res.json(availableProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// 3) Get all products by category

exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// 4) Get all products by seller

exports.getProductsBySeller = async (req,res) => {
    try{
        const { seller } = req.params;
        const products = await Product.find({ seller });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// 5) Get a single product by id

exports.getProductById = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// SEARCH FUNCTION
exports.searchProduct = async (req, res) => {
    try {
        const { q } = req.query;

        // If the query is empty , return all available products
        if(!q) {
            // Will decide later whether to use all products or only the available products
            const products = await Product.find();  // const products = await Product.find({availability: true});
            return res.json(products);
        }
        
        // Will decide the additional search criteria later
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                /*
                { description: { $regex: q, $options: 'i' } },
                {category: { $regex: q, $options: 'i' } },
                */
            ],
        });  

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}