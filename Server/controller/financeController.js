import orderModel from "../model/order.js";
import PayoutModel from "../model/payout.js";
import BankDetailsModel from "../model/bankDetails.js";
import addproductmodel from "../model/addproduct.js";

// Get Pending Payments
export const getPendingPayments = async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Pending", "Processing", "Shipped"] }
    }).populate("user", "name email");

    let pendingAmount = 0;
    const pendingOrders = [];

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      if (orderTotal > 0) {
        pendingAmount += orderTotal;
        pendingOrders.push({
          orderId: order._id,
          date: order.placedAt,
          customer: order.user?.name || order.shippingAddress?.name || "Guest",
          amount: orderTotal,
          status: order.status,
          expectedDate: new Date(order.placedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    });

    pendingOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ 
      success: true, 
      data: {
        pendingAmount,
        pendingOrders,
        totalPendingOrders: pendingOrders.length
      }
    });
  } catch (error) {
    console.error("Pending Payments Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Transaction History
export const getTransactionHistory = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    let query = { "items.sellerId": sellerId };
    
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.placedAt = {};
      if (startDate) query.placedAt.$gte = new Date(startDate);
      if (endDate) query.placedAt.$lte = new Date(endDate);
    }

    const orders = await orderModel.find(query)
      .populate("user", "name email")
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await orderModel.countDocuments(query);

    const transactions = [];
    let totalAmount = 0;

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      if (orderTotal > 0) {
        totalAmount += orderTotal;
        transactions.push({
          _id: order._id,
          orderId: order._id,
          date: order.placedAt,
          customer: order.user?.name || order.shippingAddress?.name || "Guest",
          email: order.user?.email || "N/A",
          items: sellerItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          amount: orderTotal,
          status: order.status,
          paymentId: order.paymentId
        });
      }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        transactions,
        totalAmount,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Transaction History Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Payout Requests
export const getPayoutRequests = async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    const payouts = await PayoutModel.find({ sellerId }).sort({ requestedAt: -1 });

    // Calculate available balance from completed orders
    const completedOrders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    });

    let availableBalance = 0;
    completedOrders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      availableBalance += sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    });

    // Subtract already processed/pending payouts
    const processedPayouts = payouts
      .filter(p => ["Completed", "Processing", "Pending"].includes(p.status))
      .reduce((acc, p) => acc + p.amount, 0);

    availableBalance = Math.max(0, availableBalance - processedPayouts);

    res.status(200).json({ 
      success: true, 
      data: {
        payouts,
        availableBalance,
        totalWithdrawn: payouts.filter(p => p.status === "Completed").reduce((acc, p) => acc + p.amount, 0)
      }
    });
  } catch (error) {
    console.error("Payout Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Request Payout
export const requestPayout = async (req, res) => {
  try {
    const { sellerId, amount, paymentMethod, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payout amount" });
    }

    // Verify available balance
    const completedOrders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    });

    let availableBalance = 0;
    completedOrders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      availableBalance += sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    });

    const existingPayouts = await PayoutModel.find({ 
      sellerId, 
      status: { $in: ["Completed", "Processing", "Pending"] }
    });
    const processedAmount = existingPayouts.reduce((acc, p) => acc + p.amount, 0);
    availableBalance = Math.max(0, availableBalance - processedAmount);

    if (amount > availableBalance) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const payout = new PayoutModel({
      sellerId,
      amount,
      paymentMethod: paymentMethod || "Bank Transfer",
      notes
    });

    await payout.save();

    res.status(201).json({ success: true, message: "Payout request submitted", payout });
  } catch (error) {
    console.error("Request Payout Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Commission Details
export const getCommissionDetails = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const commissionRate = 10; // Default 10%

    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    }).sort({ placedAt: -1 });

    let totalSales = 0;
    let totalCommission = 0;
    const commissionBreakdown = [];

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const commission = orderTotal * (commissionRate / 100);
      
      if (orderTotal > 0) {
        totalSales += orderTotal;
        totalCommission += commission;
        commissionBreakdown.push({
          orderId: order._id,
          date: order.placedAt,
          orderValue: orderTotal,
          commissionRate,
          commissionAmount: commission,
          netEarnings: orderTotal - commission
        });
      }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        commissionRate,
        totalSales,
        totalCommission,
        netEarnings: totalSales - totalCommission,
        commissionBreakdown: commissionBreakdown.slice(0, 50) // Last 50 transactions
      }
    });
  } catch (error) {
    console.error("Commission Details Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Bank Details
export const getBankDetails = async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    const bankDetails = await BankDetailsModel.findOne({ sellerId });

    res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    console.error("Bank Details Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Save/Update Bank Details
export const saveBankDetails = async (req, res) => {
  try {
    const { sellerId, accountHolderName, bankName, accountNumber, ifscCode, branchName, upiId } = req.body;

    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let bankDetails = await BankDetailsModel.findOne({ sellerId });

    if (bankDetails) {
      bankDetails.accountHolderName = accountHolderName;
      bankDetails.bankName = bankName;
      bankDetails.accountNumber = accountNumber;
      bankDetails.ifscCode = ifscCode;
      bankDetails.branchName = branchName;
      bankDetails.upiId = upiId;
      await bankDetails.save();
    } else {
      bankDetails = new BankDetailsModel({
        sellerId,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        upiId
      });
      await bankDetails.save();
    }

    res.status(200).json({ success: true, message: "Bank details saved successfully", data: bankDetails });
  } catch (error) {
    console.error("Save Bank Details Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Invoices
export const getInvoices = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { page = 1, limit = 20 } = req.query;

    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    })
      .populate("user", "name email")
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await orderModel.countDocuments({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    });

    const invoices = orders.map((order, index) => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      return {
        invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
        orderId: order._id,
        date: order.placedAt,
        customer: {
          name: order.user?.name || order.shippingAddress?.name || "Guest",
          email: order.user?.email || "N/A",
          address: order.shippingAddress
        },
        items: sellerItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: orderTotal,
        tax: 0,
        total: orderTotal,
        status: "Paid"
      };
    });

    res.status(200).json({ 
      success: true, 
      data: {
        invoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount
        }
      }
    });
  } catch (error) {
    console.error("Invoices Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
