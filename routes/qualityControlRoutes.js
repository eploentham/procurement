var express = require('express');
var router = express.Router();
//console.log("cashier");
const qualityController = require('../controllers/qualityController');
console.log("qualityController", qualityController);
// Quality Control Routes
router.get('/qualityControl', qualityController.getQualityControl);

module.exports = router;