const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qs = require('querystring');
const db = require('../config/database');
require('dotenv').config();

// VNPay configuration (Sandbox)
const vnp_TmnCode = process.env.VNP_TMNCODE || 'YOUR_TMNCODE';
const vnp_HashSecret = process.env.VNP_HASHSECRET || 'YOUR_HASHSECRET';
const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/result';

// Helper function to sort object (VNPay standard)
const sortObject = (obj) => {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

// Create payment URL
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, orderDescription, orderType, orderId, customerInfo, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    const date = new Date();
    const createDate = date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    const expireDate = new Date(date.getTime() + 15 * 60 * 1000); // 15 minutes
    const expireDateStr = expireDate.getFullYear() +
      ('0' + (expireDate.getMonth() + 1)).slice(-2) +
      ('0' + expireDate.getDate()).slice(-2) +
      ('0' + expireDate.getHours()).slice(-2) +
      ('0' + expireDate.getMinutes()).slice(-2) +
      ('0' + expireDate.getSeconds()).slice(-2);

    // Validate and format order ID (max 100 characters, alphanumeric only for VNPay)
    let orderIdValue = orderId || `ORDER${Date.now()}`;
    // VNPay requires alphanumeric only (no underscore or special chars)
    orderIdValue = orderIdValue.replace(/[^a-zA-Z0-9]/g, '').substring(0, 100);
    if (!orderIdValue || orderIdValue.length === 0) {
      orderIdValue = `ORDER${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    }
    
    const amountValue = Math.floor(Number(amount)); // VNPay requires integer amount
    
    // Get IP address - handle various formats
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 req.socket?.remoteAddress ||
                 (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                 '127.0.0.1';
    // Convert IPv6 localhost to IPv4 (VNPay requirement)
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1' || ipAddr.includes('::ffff:')) {
      if (ipAddr.includes('::ffff:')) {
        ipAddr = ipAddr.split('::ffff:')[1] || '127.0.0.1';
      } else {
        ipAddr = '127.0.0.1';
      }
    }
    
    // Clean and limit order description (max 255 characters, remove special chars)
    const cleanOrderDescription = (orderDescription || 'Thanh toan don hang')
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .substring(0, 255);

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderIdValue;
    vnp_Params['vnp_OrderInfo'] = cleanOrderDescription;
    vnp_Params['vnp_OrderType'] = orderType || 'other';
    vnp_Params['vnp_Amount'] = amountValue * 100; // Convert to VND (multiply by 100)
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDateStr;

    vnp_Params = sortObject(vnp_Params);

    // Create sign data string manually (VNPay format: key1=value1&key2=value2...)
    // Note: VNPay requires raw values (not URL encoded) for hash calculation
    const signData = Object.keys(vnp_Params)
      .map(key => {
        const value = String(vnp_Params[key]);
        // Use raw value, not URL encoded for hash
        return `${key}=${value}`;
      })
      .join('&');
    
    // Debug log (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('VNPay Sign Data:', signData);
      console.log('VNPay HashSecret length:', vnp_HashSecret?.length || 0);
      console.log('VNPay TMNCode:', vnp_TmnCode);
    }
    
    // Validate HashSecret
    if (!vnp_HashSecret || vnp_HashSecret === 'YOUR_HASHSECRET') {
      return res.status(500).json({ error: 'VNPay HashSecret chưa được cấu hình' });
    }
    
    if (!vnp_TmnCode || vnp_TmnCode === 'YOUR_TMNCODE') {
      return res.status(500).json({ error: 'VNPay TMNCode chưa được cấu hình' });
    }
    
    // Create hash using SHA512 (VNPay 2.1.0 requirement)
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(signData, 'utf-8').digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('VNPay SecureHash:', signed.substring(0, 32) + '...');
    }

    // Create payment URL with proper encoding
    const paymentUrl = vnp_Url + '?' + Object.keys(vnp_Params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}`)
      .join('&');

    // Save order to database if customerInfo and items are provided
    if (customerInfo && items && items.length > 0) {
      try {
        const [orderResult] = await db.query(
          `INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, status)
           VALUES (?, ?, ?, ?, ?, ?, 'vnpay', 'pending')`,
          [
            orderIdValue,
            customerInfo.name || null,
            customerInfo.email || null,
            customerInfo.phone || null,
            customerInfo.address || null,
            amountValue,
          ]
        );

        const orderDbId = orderResult.insertId;

        // Save order items
        for (const item of items) {
          await db.query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price, subtotal)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              orderDbId,
              item.product_id || null,
              item.name || 'Unknown Product',
              item.slug || null,
              item.quantity || 1,
              item.price || 0,
              (item.price || 0) * (item.quantity || 1),
            ]
          );
        }
      } catch (dbError) {
        console.error('Error saving order to database:', dbError);
        // Continue even if order save fails
      }
    }

    res.json({ paymentUrl, orderId: orderIdValue });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Error creating payment URL' });
  }
});

// Handle payment return
router.get('/vnpay-return', async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = secureHash === signed;

  const responseCode = vnp_Params['vnp_ResponseCode'];
  const orderId = vnp_Params['vnp_TxnRef'];
  const amount = vnp_Params['vnp_Amount'] / 100; // Convert back from VND
  const transactionId = vnp_Params['vnp_TransactionNo'];

  // Update order status in database
  if (isValid && orderId) {
    try {
      const status = responseCode === '00' ? 'paid' : 'pending';
      await db.query(
        `UPDATE orders 
         SET status = ?, 
             vnpay_transaction_id = ?, 
             vnpay_response_code = ?, 
             updated_at = NOW() 
         WHERE order_id = ?`,
        [status, transactionId || null, responseCode || null, orderId]
      );
    } catch (dbError) {
      console.error('Error updating order status:', dbError);
      // Continue even if update fails
    }
  }

  res.json({
    success: isValid && responseCode === '00',
    isValid,
    responseCode,
    orderId,
    amount,
    message: responseCode === '00' ? 'Giao dịch thành công' : 'Giao dịch thất bại',
  });
});

// Handle payment IPN (Instant Payment Notification)
router.post('/vnpay-ipn', async (req, res) => {
  // VNPay sends IPN via POST with data in req.body or req.query
  let vnp_Params = req.body || req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = secureHash === signed;
  const responseCode = vnp_Params['vnp_ResponseCode'];
  const orderId = vnp_Params['vnp_TxnRef'];
  const transactionId = vnp_Params['vnp_TransactionNo'];

  if (isValid && orderId) {
    try {
      const status = responseCode === '00' ? 'paid' : 'pending';
      await db.query(
        `UPDATE orders 
         SET status = ?, 
             vnpay_transaction_id = ?, 
             vnpay_response_code = ?, 
             updated_at = NOW() 
         WHERE order_id = ?`,
        [status, transactionId || null, responseCode || null, orderId]
      );
    } catch (dbError) {
      console.error('Error updating order status in IPN:', dbError);
      // Continue even if update fails
    }
    res.status(200).json({ RspCode: '00', Message: 'Success' });
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
  }
});

module.exports = router;
