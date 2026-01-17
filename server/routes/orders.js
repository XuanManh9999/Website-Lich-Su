const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách đơn hàng (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    let params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (order_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    let countParams = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (order_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      data: rows,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        total,
        totalPages: Math.ceil(total / (parseInt(limit) || 10)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy chi tiết đơn hàng (admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    order.items = items;
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const {
      order_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total_amount,
      payment_method = 'vnpay',
    } = req.body;

    if (!order_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order ID and items are required' });
    }

    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [order_id, customer_name || null, customer_email || null, customer_phone || null, customer_address || null, total_amount || 0, payment_method]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id || null,
          item.product_name || 'Unknown Product',
          item.product_slug || null,
          item.quantity || 1,
          item.price || 0,
          (item.price || 0) * (item.quantity || 1),
        ]
      );
    }

    res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Order ID already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật trạng thái đơn hàng (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'paid', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query(
      'UPDATE orders SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [status, notes || null, id]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật thông tin thanh toán VNPay
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { vnpay_transaction_id, vnpay_response_code, status = 'paid' } = req.body;

    await db.query(
      'UPDATE orders SET vnpay_transaction_id = ?, vnpay_response_code = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [vnpay_transaction_id || null, vnpay_response_code || null, status, id]
    );

    res.json({ message: 'Payment information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy đơn hàng theo order_id
router.get('/order/:order_id', authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.params;
    
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );
    
    order.items = items;
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
