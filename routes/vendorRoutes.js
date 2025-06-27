var express = require('express');
var router = express.Router();
//console.log("cashier");
const vendorController = require('../controllers/vendorController.js');

console.log("vendorController", vendorController);
// ดึง vendor ทั้งหมด
router.get('/vendors', vendorController.getAllVendors);

// ดึง vendor ตาม id
router.get('/vendors/:id', vendorController.getVendorById);

// สร้าง vendor ใหม่
router.post('/vendors', vendorController.createVendor);

// อัปเดต vendor
router.put('/vendors/:id', vendorController.updateVendor);

// ลบ vendor
router.delete('/vendors/:id', vendorController.deleteVendor);

// ดึง dropdown
router.get('/vendors/dropdown', vendorController.getVendorsDropdown);
// Authentication Routes
module.exports = router;