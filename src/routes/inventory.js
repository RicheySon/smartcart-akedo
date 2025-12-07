const express = require('express');
const router = express.Router();
const {
  addItem,
  getInventory,
  getItem,
  updateItem,
  deleteItem,
  importReceipt,
  getExpiringSoon,
  getByCategory,
  getTotalValue,
  importOCR
} = require('../controllers/InventoryController');

router.post('/', addItem);

router.get('/', getInventory);

router.get('/expiring-soon', getExpiringSoon);

router.get('/by-category/:category', getByCategory);

router.get('/total-value', getTotalValue);

router.get('/:id', getItem);

router.put('/:id', updateItem);

router.delete('/:id', deleteItem);

router.post('/import-receipt', importReceipt);
router.post('/import-ocr', importOCR);

module.exports = router;






