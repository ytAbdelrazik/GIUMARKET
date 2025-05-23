const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MIDDLEWARE FOR IMAGE UPLOADS USING MULTER

/*
    Ali Amr (Note):
        This middleware file ensures that:
        1) The 'uploads' directory and corresponding subdirectories ('uploads/proofs' and 'uploads/receipts') exist.
        2) The uploaded files are saved in the uploads directory.
          2.1- Proofs are saved in the 'uploads/proofs' directory
          2.2- Receipts are saved in the 'uploads/receipts' directory
        3) The uploaded files are named with a unique timestamp.
        4) Only image files are accepted (JPEG, PNG, JPG).
        5) The maximum file size is limited to 5MB.
*/

// Base upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Method to create the upload directory if it doesn't exist
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Create the base upload directory if it doesn't exist
createFolderIfNotExists(uploadDir);

// Create subdirectories for receipts and proofs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "uploads/";

        if (file.fieldname === "receipt") {
            uploadPath += "receipts/";
        } else if (file.fieldname === "proof") {
            uploadPath += "proofs/";
        } else if (file.fieldname === "productImage") { // ADDED PRODUCT IMAGE UPLOAD FUNCTIONALITY
          uploadPath += "products/";
        }


        // Ensure folder exists
        createFolderIfNotExists(uploadPath);

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + Date.now() + ext);
    },
  });

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."), false);
  }
};

// Set upload limits (max file size 5MB) - can be adjusted as needed
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

module.exports = upload;