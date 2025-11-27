import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import sellermodel from "../model/sellermodel.js";
import addproductmodel from "../model/addproduct.js";
import { v2 as cloudinary } from "cloudinary";
import orderModel from "../model/order.js";
import usermodel from "../model/mongobd_usermodel.js";

// List all users
export const userlist = async (req, res) => {
  try {
    const users = await usermodel.find();
    if (!users) {
      return res.json({ success: false, message: "no users found" });
    }
    return res.json({ success: true, users });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Register Seller
export const registerseller = async (req, res) => {
  try {
    const { name, email, password, nickName } = req.body;

    if (!name || !password || !email || !nickName) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }
    const existing = await sellermodel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "user allready exists" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);

    const sellerdata = {
      name, email,
      password: hashedpass,
      nickName
    };

    const newseller = new sellermodel(sellerdata);
    const seller = await newseller.save();

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET);
    return res.json({ success: true, token, message: "registered succesfuly", name: name });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: e.message });
  }
}

// Login Seller
export const loginseller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await sellermodel.findOne({ email });
    if (!seller) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const ismatch = await bcrypt.compare(password, seller.password);
    if (ismatch) {
      const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET);
      res.json({
        success: true,
        token,
        message: "Login Successful",
        user: {
          name: seller.name,
          email: seller.email,
          id: seller._id,
          nickName: seller.nickName
        }
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark Order Complete
export const ordercomplete = async (req, res) => {
  try {
    const { sellerid, orderid } = req.body;
    const orderdata = await orderModel.findById(orderid);

    if (orderdata && orderdata.sellerid === sellerid) {
      await orderModel.findByIdAndUpdate(orderid, {
        completed: true,
      });
      return res.json({ success: true, message: "Order Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add Products
export const addproducts = async (req, res) => {
  try {
    const { title, description, price, categoryname, subcategory, oldprice, discount, ingredients, brand, additional_details, size, sellerId, stock } = req.body;
    const files = req.files;

    if (!title || !description || !price || !categoryname || !subcategory || !oldprice || !discount || !sellerId || !stock) {
      return res.status(400).json({ message: 'Please provide all required fields with images.' });
    }

    const uploadedImages = await Promise.all(
      files.map(file =>
        cloudinary.uploader.upload(file.path, { resource_type: "image" })
      )
    );

    const imageUrls = uploadedImages.map(img => ({
      url: img.secure_url,
      altText: title,
    }));

    const newProduct = new addproductmodel({
      title,
      description,
      price,
      categoryname,
      images: imageUrls,
      subcategory,
      oldprice,
      discount,
      ingredients,
      brand,
      additional_details,
      size,
      sellerId,
      stock: Number(stock)
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: savedProduct,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to add product',
      details: err.message,
    });
  }
};

// Get Seller Profile
export const getSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.body;
    let seller = await sellermodel.findById(sellerId);

    if (seller) {
      return res.status(200).json({ success: true, seller });
    } else {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Seller Profile (Enhanced)
export const updateSellerProfile = async (req, res) => {
  try {
    const { sellerId, name, email, phone, nickName, about, holidayMode } = req.body;

    let seller = await sellermodel.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Update fields if provided
    if (name) seller.name = name;
    if (email) seller.email = email;
    if (phone) seller.phone = phone;
    if (nickName) seller.nickName = nickName;
    if (about) seller.about = about;
    if (typeof holidayMode !== 'undefined') seller.holidayMode = holidayMode;

    await seller.save();
    return res.status(200).json({ success: true, message: "Profile updated successfully", seller });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Seller Specific Orders
export const getSellerOrders = async (req, res) => {
  const { sellerId } = req.body;
  try {
    const orders = await orderModel.find({
      items: {
        $elemMatch: { sellerId }
      }
    })
      .populate("user", "name email")
      .populate("items.productId", "title price brand images")
      .sort({ placedAt: -1 });

    if (!orders.length) {
      return res.status(200).json({ success: true, filteredOrders: [] }); // Return empty array instead of 404
    }

    const filteredOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId);
      return {
        _id: order._id,
        user: order.user,
        items: sellerItems,
        totalAmount: sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        shippingAddress: order.shippingAddress,
        placedAt: order.placedAt,
        status: order.status,
        image: order.image,
        paymentId: order.paymentId
      };
    });
    res.status(200).json({ success: true, filteredOrders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Seller Details
export const getSeller = async (req, res) => {
  const { sellerId } = req.body
  const seller = await sellermodel.find({ _id: sellerId })

  if (!seller.length) {
    return res.status(404).json({ message: "seller not found" })
  }

  return res.status(200).json({ success: true, seller });
}

// Dashboard Stats
export const getSellerDashboardStats = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const products = await addproductmodel.find({ sellerId });
    const orders = await orderModel.find({ "items.sellerId": sellerId });

    let totalOrders = 0;
    let totalSales = 0;
    let totalRevenue = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId?.toString() === sellerId.toString()) {
          totalOrders += 1;
          totalSales += item.price * item.quantity;
        }
      });
    });
    totalRevenue = totalSales;

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalSales,
        totalRevenue,
        totalProducts: products.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// Update Order Status
export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.sellerId || req.body.sellerId;

    const order = await orderModel.findOne({
      _id: orderId,
      "items.sellerId": sellerId
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for this seller" });
    }

    order.items.forEach((item) => {
      if (item.sellerId.toString() === sellerId.toString()) {
        item.status = status;
      }
    });
    order.status = status;

    await order.save();
    return res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- NEW: Get Seller Earnings & Transactions ---
export const getSellerEarnings = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      // Consider Delivered/Completed status for earnings
      status: { $in: ["Delivered", "Completed", "Pending", "Processing", "Shipped"] } 
    }).populate("user", "name email");

    let totalEarnings = 0;
    const transactions = [];

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      if (orderTotal > 0) {
        totalEarnings += orderTotal;
        transactions.push({
          orderId: order._id,
          date: order.placedAt,
          customer: order.user?.name || order.shippingAddress?.name || "Guest",
          amount: orderTotal,
          status: order.status
        });
      }
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ 
      success: true, 
      data: {
        totalEarnings,
        pendingClearance: 0,
        transactions
      }
    });
  } catch (error) {
    console.error("Earnings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- NEW: Get My Customers ---
export const getSellerCustomers = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const orders = await orderModel.find({ "items.sellerId": sellerId })
      .populate("user", "name email");

    const uniqueCustomers = {};

    orders.forEach(order => {
      // Use shipping address if user relation is missing
      const customerId = order.user?._id?.toString() || order.shippingAddress?.phone;
      const customerName = order.user?.name || order.shippingAddress?.name || "Guest";
      const customerEmail = order.user?.email || "N/A";
      const customerPhone = order.shippingAddress?.phone || "N/A";

      if (customerId) {
        const orderValue = order.items
          .filter(item => item.sellerId.toString() === sellerId.toString())
          .reduce((acc, item) => acc + (item.price * item.quantity), 0);

        if (!uniqueCustomers[customerId]) {
          uniqueCustomers[customerId] = {
            _id: customerId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.placedAt
          };
        }

        uniqueCustomers[customerId].totalOrders += 1;
        uniqueCustomers[customerId].totalSpent += orderValue;
        if (new Date(order.placedAt) > new Date(uniqueCustomers[customerId].lastOrderDate)) {
          uniqueCustomers[customerId].lastOrderDate = order.placedAt;
        }
      }
    });

    res.status(200).json({ success: true, customers: Object.values(uniqueCustomers) });
  } catch (error) {
    console.error("Customer Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};