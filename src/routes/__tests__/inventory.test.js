const request = require('supertest');
const express = require('express');
const inventoryRouter = require('../inventory');
const inventory = require('../../models/Inventory');
const { errorHandler, notFoundHandler } = require('../../middleware/errorHandler');

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRouter);
app.use(notFoundHandler);
app.use(errorHandler);

describe('Inventory Routes', () => {
  beforeEach(() => {
    inventory.clear();
  });

  describe('POST /api/inventory', () => {
    it('should create a new item', async () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
        unit: 'liters',
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(itemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Milk');
      expect(response.body.data.quantity).toBe(2);
    });

    it('should return 400 for missing name', async () => {
      const itemData = {
        quantity: 2,
        category: 'dairy',
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 400 for invalid quantity', async () => {
      const itemData = {
        name: 'Milk',
        quantity: -1,
        category: 'dairy',
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid category', async () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'invalid',
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory', () => {
    it('should return empty array when no items', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all items', async () => {
      inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      inventory.add({
        name: 'Bread',
        quantity: 1,
        category: 'pantry',
        price: 2.50,
      });

      const response = await request(app)
        .get('/api/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/inventory/:id', () => {
    it('should return specific item', async () => {
      const item = inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      const response = await request(app)
        .get(`/api/inventory/${item.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(item.id);
      expect(response.body.data.name).toBe('Milk');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/inventory/invalid_id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should update item quantity', async () => {
      const item = inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      const response = await request(app)
        .put(`/api/inventory/${item.id}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(5);
    });

    it('should return 400 for invalid update data', async () => {
      const item = inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
      });

      const response = await request(app)
        .put(`/api/inventory/${item.id}`)
        .send({ quantity: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/inventory/invalid_id')
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should delete item', async () => {
      const item = inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
      });

      const response = await request(app)
        .delete(`/api/inventory/${item.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Milk');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/inventory/invalid_id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory/expiring-soon', () => {
    it('should return items expiring soon', async () => {
      inventory.add({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      const response = await request(app)
        .get('/api/inventory/expiring-soon')
        .query({ days: 7 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for invalid days parameter', async () => {
      const response = await request(app)
        .get('/api/inventory/expiring-soon')
        .query({ days: 500 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/inventory/import-receipt', () => {
    it('should import items from receipt', async () => {
      const receiptData = {
        purchase_date: new Date().toISOString(),
        items: [
          { name: 'Milk', quantity: 2, category: 'dairy', price: 3.99 },
          { name: 'Bread', quantity: 1, category: 'pantry', price: 2.50 },
        ],
      };

      const response = await request(app)
        .post('/api/inventory/import-receipt')
        .send(receiptData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.added.length + response.body.updated.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid receipt data', async () => {
      const response = await request(app)
        .post('/api/inventory/import-receipt')
        .send({ items: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

