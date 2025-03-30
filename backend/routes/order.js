const express = require('express');
const upload = require('../middleware/upload');
const Order = require('../models/order');
const { uploadReceipt, uploadProof } = require('../controllers/order');
const router = express.Router();

//////

// IMAGE UPLOAD ROUTES (Ali Amr)

/*
    How to test the image uploades:
    1) Use Postman to send a POST request to the following endpoints:
        - Payment Proof : http://localhost:8080/api/orders/upload-proof/:OrderId
        - Product Receipt: http://localhost:8080/api/orders/upload-receipt/:OrderId
    2) Enter the OrderId in the URL params (instead of 'OrderId' in the end of the URL).
    3) Enter the image file:
        3.1- Go to the 'Body' tab in Postman.
        3.2- Select 'form-data' from the dropdown.
        3.3- Enter the key as 'receipt' or 'proof' (depending on which one you are testing).
        3.4- Select 'File' from the dropdown. (Within the Key Box should be 'Text' by default).
        3.5- Upload the image file from your computer in the value section.
        3.6- Send the request.
    4) You should receive a success message with the order details in the response.
    5) The uploaded image will be saved in the 'uploads' folder in the root directory of the project.
        - Payment Proof: uploads/proofs
        - Product Receipt: uploads/receipts
    6) The file path of the uploaded image will be saved in the database in the 'buyerReceipt' or 'sellerProof' field of the order document.

*/

router.post('/upload-receipt/:orderId', upload.single('receipt'), uploadReceipt);
router.post('/upload-proof/:orderId', upload.single('proof'), uploadProof);

//////

module.exports = router;