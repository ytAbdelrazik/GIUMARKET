const mongoose = require("mongoose");
const User = require("./user");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },  

    description: {
        type: String,
        required: true,
        trim: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // WE WILL DECIDE THE CATEGORY OPTIONS LATER (ENUM)
    category: {
        type: String,
        enum: ["Study Materials", "Project Supplies", "Accessories", "Other"],
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 0,
    },

    condition: {
        type: String,
        enum: ["New", "Used"],
        required: true,
    },

    availability: {
        type: Boolean,
        default: function () {
            return this.quantity > 0;
        },
    },

    // IMAGES:
    
    // WE WILL DECIDE WHETHER TO USE IMAGES TO DISPLAY PRODUCTS OR NOT
    
    // OPTION 1:

    // We can store the images in a cloud service storage (AWS S3, Google Cloud Storage, Firebase, etc.) and save the URLs in the database

    /*
     images: {
         type: [String],
         default: [],
     },
     */

     // OPTION 2:

     // We can store the images directly in the database (MORE COMPLEX)

     /*
     images: {
         type: [{
             data: Buffer,
             contentType: String,
         }],
         default: [],
     },
     */



} , {timestamps: true});


// HOOKS:

// Pre - Validate Hook to ensure that the availabilty is updated when the quanity changes
productSchema.pre("validate", function (next){
    this.availability = this.quantity > 0;
    next();
})

module.exports = mongoose.model("Product", productSchema);
