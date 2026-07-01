'use strict';

const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect } = require('../../middleware/auth.middleware');

// Protect checkout actions
router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.post('/verify',       paymentController.verifyPayment);

module.exports = router;
