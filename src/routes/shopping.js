const express = require('express');
const router = express.Router();
const {
  searchAcrossVendors,
  comparePrices,
  searchAmazon,
  searchWalmart,
  getAmazonProduct,
  getWalmartProduct,
  buildOptimalCart,
} = require('../controllers/ShoppingController');

router.get('/search', searchAcrossVendors);

router.get('/compare/:item', comparePrices);

router.get('/amazon/search', searchAmazon);

router.get('/walmart/search', searchWalmart);

router.get('/amazon/:id', getAmazonProduct);

router.get('/walmart/:id', getWalmartProduct);

router.post('/build-cart', buildOptimalCart);

module.exports = router;


