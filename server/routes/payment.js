const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
require('dotenv').config();

// VNPay configuration
const VNPAY_CONFIG = {
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_TmnCode: process.env.VNP_TMNCODE || '',
  vnp_HashSecret: process.env.VNP_HASHSECRET || '',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/result'
};

const VNPAY_RESPONSE_MESSAGES = {
  '00': 'Giao dịch thành công',
  '01': 'Giao dịch chưa hoàn tất',
  '02': 'Merchant không hợp lệ',
  '03': 'Dữ liệu gửi sang không đúng định dạng',
  '04': 'Không có dữ liệu giao dịch',
  '05': 'Giao dịch bị từ chối',
  '06': 'Mã OrderId đã tồn tại',
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '08': 'Giao dịch bị hủy bởi khách hàng',
  '09': 'Giao dịch hết thời gian thanh toán',
  '10': 'Đã vượt quá hạn mức thanh toán',
  '11': 'Giao dịch bị từ chối bởi ngân hàng phát hành thẻ',
  '12': 'Giao dịch bị từ chối bởi VNPAY',
  '13': 'Giao dịch chờ khách hàng xác nhận',
  '24': 'Giao dịch bị hủy'
};

// Format date theo timezone GMT+7 (Vietnam)
const formatVNPayDate = (date) => {
  const vietnamOffset = 7 * 60; // GMT+7 in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const vietnamDate = new Date(utc + (vietnamOffset * 60000));
  
  const pad = (number) => number.toString().padStart(2, '0');
  return (
    vietnamDate.getFullYear().toString() +
    pad(vietnamDate.getMonth() + 1) +
    pad(vietnamDate.getDate()) +
    pad(vietnamDate.getHours()) +
    pad(vietnamDate.getMinutes()) +
    pad(vietnamDate.getSeconds())
  );
};

// Build query string for VNPay
const buildQueryString = (params, { encodeKey = true, sort = true } = {}) => {
  const keys = Object.keys(params);
  if (sort) {
    keys.sort();
  }
  return keys
    .map((key) => {
      const encodedKey = encodeKey ? encodeURIComponent(key) : key;
      const encodedValue = encodeURIComponent(params[key]).replace(/%20/g, '+');
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
};

// Validate VNPay config
const ensureVNPayConfig = () => {
  // Only warn, don't throw error - allow to continue for testing
  if (!VNPAY_CONFIG.vnp_TmnCode || !VNPAY_CONFIG.vnp_HashSecret) {
    console.warn('VNPay config missing. VNP_TMNCODE or VNP_HASHSECRET not set.');
    // In production, you might want to throw error here
    // throw new Error('Thiếu cấu hình VNPay. Vui lòng kiểm tra biến môi trường.');
  }
  if (!VNPAY_CONFIG.vnp_ReturnUrl) {
    console.warn('VNPay return URL not set. Using default.');
  }
};

// Get order from database
const getOrderFromDB = async (orderId) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? OR id = ?', [orderId, orderId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting order from DB:', error);
    return null;
  }
};

// Save payment transaction
const savePaymentTransaction = async (orderDbId, transactionId, amount, status) => {
  try {
    // orderDbId should be the database ID (integer), not order_id (string)
    await db.query(
      'INSERT INTO payments (order_id, transaction_id, amount, status) VALUES (?, ?, ?, ?)',
      [orderDbId, transactionId, amount, status]
    );
  } catch (error) {
    console.error('Error saving payment transaction:', error);
    throw error;
  }
};

// Create payment URL
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, orderDescription, orderType, orderId, customerInfo, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    ensureVNPayConfig();

    // Validate and format order ID (max 100 characters, alphanumeric only for VNPay)
    let orderIdValue = orderId || `ORDER${Date.now()}`;
    orderIdValue = orderIdValue.replace(/[^a-zA-Z0-9]/g, '').substring(0, 100);
    if (!orderIdValue || orderIdValue.length === 0) {
      orderIdValue = `ORDER${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    }

    const normalizedAmount = Math.round(Number(amount) * 100);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'Số tiền thanh toán không hợp lệ' });
    }

    // Get IP address - handle various formats
    let clientIp = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                   '127.0.0.1';
    // Convert IPv6 localhost to IPv4 (VNPay requirement)
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp.includes('::ffff:')) {
      if (clientIp.includes('::ffff:')) {
        clientIp = clientIp.split('::ffff:')[1] || '127.0.0.1';
      } else {
        clientIp = '127.0.0.1';
      }
    }

    const now = new Date();
    const txnRef = `ORDER${orderIdValue}_${Date.now()}`;
    
    // Expire time: 60 minutes
    const expireTime = new Date(now.getTime() + 60 * 60 * 1000);

    // Clean order description
    const cleanOrderDescription = (orderDescription || `Thanh toan don hang #${orderIdValue}`)
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .substring(0, 255);

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: cleanOrderDescription,
      vnp_OrderType: orderType || 'other',
      vnp_Amount: normalizedAmount,
      vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: formatVNPayDate(now),
      vnp_ExpireDate: formatVNPayDate(expireTime)
    };

    // Build sign data (not URL encoded for hash)
    const signData = buildQueryString(vnpParams, { encodeKey: false });
    
    // Create hash
    const vnpSecureHash = crypto
      .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const paymentParams = {
      ...vnpParams,
      vnp_SecureHash: vnpSecureHash
    };

    // Try to find existing order first (order may have been created in Checkout.js)
    let order = await getOrderFromDB(orderIdValue);
    let orderDbId;
    
    try {
      if (!order) {
        // Order doesn't exist, create it if customerInfo and items are provided
        if (customerInfo && items && items.length > 0) {
          const [orderResult] = await db.query(
            `INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, status, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, 'vnpay', 'pending', 'unpaid')`,
            [
              orderIdValue,
              customerInfo.name || null,
              customerInfo.email || null,
              customerInfo.phone || null,
              customerInfo.address || null,
              amount,
            ]
          );

          orderDbId = orderResult.insertId;

          // Save order items
          for (const item of items) {
            await db.query(
              `INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price, subtotal)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                orderDbId,
                item.product_id || null,
                item.product_name || 'Unknown Product',
                item.product_slug || null,
                item.quantity || 1,
                item.price || 0,
                (item.price || 0) * (item.quantity || 1),
              ]
            );
          }
        } else {
          // Create minimal order if no customer info
          const [orderResult] = await db.query(
            `INSERT INTO orders (order_id, total_amount, payment_method, status, payment_status)
             VALUES (?, ?, 'vnpay', 'pending', 'unpaid')`,
            [orderIdValue, amount]
          );
          orderDbId = orderResult.insertId;
        }
      } else {
        // Order already exists, use its ID
        orderDbId = order.id;
        // Update payment method if needed
        await db.query(
          `UPDATE orders SET payment_method = 'vnpay' WHERE id = ?`,
          [orderDbId]
        );
      }
      
      // Save payment transaction
      await savePaymentTransaction(orderDbId, txnRef, amount, 'pending');
    } catch (dbError) {
      console.error('Error handling order/payment in database:', dbError);
      // If it's a duplicate entry error, try to get existing order
      if (dbError.code === 'ER_DUP_ENTRY') {
        try {
          order = await getOrderFromDB(orderIdValue);
          if (order) {
            orderDbId = order.id;
            await savePaymentTransaction(orderDbId, txnRef, amount, 'pending');
          }
        } catch (retryError) {
          console.error('Error retrying with existing order:', retryError);
          // Continue anyway - payment URL will still be created
        }
      } else {
        // For other errors, log but continue - payment URL will still be created
        console.error('Database error, but continuing with payment URL creation:', dbError.message);
      }
    }

    // Build payment URL
    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${buildQueryString(paymentParams)}`;

    res.json({ paymentUrl, orderId: orderIdValue, transaction_ref: txnRef });
  } catch (error) {
    console.error('Error creating payment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Thiếu cấu hình')) {
      return res.status(500).json({ 
        error: 'Cấu hình VNPay chưa đầy đủ. Vui lòng liên hệ quản trị viên.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Lỗi khi tạo link thanh toán',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle payment return (callback from VNPay)
router.get('/vnpay-return', async (req, res) => {
  try {
    ensureVNPayConfig();
    
    let vnpParams = { ...req.query };
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Build sign data
    const signData = buildQueryString(vnpParams, { encodeKey: false });
    const expectedHash = crypto
      .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const isValid = secureHash === expectedHash;

    if (!isValid) {
      return res.json({
        success: false,
        isValid: false,
        message: 'Invalid signature',
      });
    }

    // Extract transaction info
    const txnRef = vnpParams['vnp_TxnRef'];
    const orderIdMatch = txnRef.match(/^ORDER(.+?)_/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    
    if (!orderId) {
      return res.json({
        success: false,
        message: 'Order reference is invalid',
      });
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const transactionNo = vnpParams['vnp_TransactionNo'];
    const amount = Number(vnpParams['vnp_Amount']) / 100;

    let paymentStatus = 'failed';
    let orderPaymentStatus = 'unpaid';
    let orderStatus = 'pending';
    let message = VNPAY_RESPONSE_MESSAGES[responseCode] || `Giao dịch thất bại (mã: ${responseCode})`;

    if (responseCode === '00') {
      paymentStatus = 'success';
      orderPaymentStatus = 'paid';
      orderStatus = 'paid';
      message = VNPAY_RESPONSE_MESSAGES['00'];
    }

    // Update order and payment
    try {
      const order = await getOrderFromDB(orderId);
      if (order) {
        await db.query(
          'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
          [orderPaymentStatus, orderStatus, order.id]
        );

        await db.query(
          `UPDATE payments SET 
           status = ?, 
           vnpay_transaction_no = ?,
           vnpay_response_code = ?,
           payment_date = NOW()
           WHERE order_id = ? AND transaction_id LIKE ?`,
          [paymentStatus, transactionNo, responseCode, order.id, `ORDER${orderId}_%`]
        );
      } else {
        console.warn(`Order not found for orderId: ${orderId} in callback`);
      }
    } catch (dbError) {
      console.error('Error updating order status:', dbError);
    }

    res.json({
      success: responseCode === '00',
      isValid: true,
      responseCode,
      orderId,
      amount,
      transaction_no: transactionNo,
      message,
    });
  } catch (error) {
    console.error('Error in vnpay-return:', error);
    res.status(500).json({ error: error.message || 'Error processing payment return' });
  }
});

// Handle payment IPN (Instant Payment Notification)
router.post('/vnpay-ipn', async (req, res) => {
  try {
    ensureVNPayConfig();
    
    // VNPay sends IPN via POST with data in req.body or req.query
    let vnpParams = req.body || req.query;
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Build sign data
    const signData = buildQueryString(vnpParams, { encodeKey: false });
    const expectedHash = crypto
      .createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const isValid = secureHash === expectedHash;

    if (!isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    // Extract transaction info
    const txnRef = vnpParams['vnp_TxnRef'];
    const orderIdMatch = txnRef.match(/^ORDER(.+?)_/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    
    if (!orderId) {
      return res.status(200).json({ RspCode: '99', Message: 'Order reference is invalid' });
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const transactionNo = vnpParams['vnp_TransactionNo'];
    const amount = Number(vnpParams['vnp_Amount']) / 100;

    let paymentStatus = 'failed';
    let orderPaymentStatus = 'unpaid';
    let orderStatus = 'pending';

    if (responseCode === '00') {
      paymentStatus = 'success';
      orderPaymentStatus = 'paid';
      orderStatus = 'paid';
    }

    // Update order and payment
    try {
      const order = await getOrderFromDB(orderId);
      if (order) {
        await db.query(
          'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
          [orderPaymentStatus, orderStatus, order.id]
        );

        await db.query(
          `UPDATE payments SET 
           status = ?, 
           vnpay_transaction_no = ?,
           vnpay_response_code = ?,
           payment_date = NOW()
           WHERE order_id = ? AND transaction_id LIKE ?`,
          [paymentStatus, transactionNo, responseCode, order.id, `ORDER${orderId}_%`]
        );
      }
    } catch (dbError) {
      console.error('Error updating order status in IPN:', dbError);
      return res.status(200).json({ RspCode: '99', Message: 'Database error' });
    }

    res.status(200).json({ RspCode: '00', Message: 'Success' });
  } catch (error) {
    console.error('Error in vnpay-ipn:', error);
    res.status(200).json({ RspCode: '99', Message: error.message || 'Unknown error' });
  }
});

module.exports = router;
