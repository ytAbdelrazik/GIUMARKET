const Order = require("../models/order");
const Product = require("../models/product");
const fs = require("fs");
const path = require("path");



//  METHODS TO UPLOAD IMAGES (Payment Proof and Product Receipt) 

/*
    Notes: 
    1)The images are uploaded locally in the 'uploads' folder and the paths are stored in the mongodb database.
    - Payment Proof: uploads/proofs
    - Product Receipt: uploads/receipts

    2)The 'buyerReceipt' and 'sellerProof' fields are stored as strings, which will be the 'local' file paths of the uploaded images stored
    locally in the 'uploads' folder.

    3)The testing methodology for the image uploades is located in the Order routes file.
*/




/*
YT
      **Function to mark a product as sold**
  This function will be called after the order is completed and the payment is confirmed from seller
   either button from gui or we can integrate it with the reciept uploading
  It will update the product's availability status to false
*/
const markProductAsSold = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error("Order not found");
        }

        // Ensure the order has a product ID associated
        if (!order.product) {
            throw new Error("No product associated with this order");
        }

        const product = await Product.findById(order.product);
        if (!product) {
            throw new Error("Product not found");
        }

        // Mark the product as sold
        product.availability = false;
        await product.save();

        console.log(`Product ${product} marked as sold.`);
    } catch (error) {
        console.error("Error marking product as sold:", error);
    }
};


// Function to delete the file locally if it exists
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const uploadReceipt = async (req, res) => {
    try{
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Delete the old receipt if it exists so that the new one is saved
        if (order.buyerReceipt) {
            deleteFile(order.buyerReceipt); 
        }

        order.buyerReceipt = req.file.path;
        await order.save();
        res.status(200).json({ message: "Receipt uploaded successfully", order });
    } catch (error) {
        console.error("Error uploading receipt:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const uploadProof = async (req, res) => {
    try{
        const {orderId} = req.params;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

         // Delete the old proof if it exists so that the new one is saved
         if (order.sellerProof) {
            deleteFile(order.sellerProof);
        }

        order.sellerProof = req.file.path;

        await order.save();

        res.json({ message: "Proof uploaded successfully", order });
    } catch (error) {
        console.error("Error uploading proof:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { uploadReceipt, uploadProof ,markProductAsSold};