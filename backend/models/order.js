const mongoose = require("mongoose");

/* 
    Ali Amr (Note):
        This is a temporary order schema please modify as needed later.
        I created this schema solely for the purpose of testing the image uploades for the 'Payment Proof' and 'Product Receipt'.
        The 'buyerReceipt' and 'sellerProof' fields are stored as strings, which will be the 'local' file paths of the uploaded images stored
        locally in the 'uploads' folder.
*/

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    buyerReceipt: {
        type: String,
    },
    sellerProof: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "canceled"],
        default: "pending",
    },
 }, 
 { timestamps: true }    
);

orderSchema.pre("save" , function (next) {
    if ((!this.buyerReceipt || !this.sellerProof) && this.status === "completed") {
        return next(new Error("Both buyerReceipt and sellerProof are required when the order is completed."));
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;