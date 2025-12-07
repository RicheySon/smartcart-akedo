const express = require('express');
const router = express.Router();
const {
  previewTransaction,
  createTransaction,
  approveTransaction,
  rejectTransaction,
  getPendingTransactions,
  getTransactionHistory,
  getTransaction,
} = require('../controllers/TransactionController');

router.post('/preview', previewTransaction);

router.post('/create', createTransaction);

router.post('/:id/approve', approveTransaction);

router.post('/:id/reject', rejectTransaction);

router.get('/pending', getPendingTransactions);

router.get('/history', getTransactionHistory);

router.get('/:id', getTransaction);

module.exports = router;


