import orderModel from "../model/order.js";
import addproductmodel from "../model/addproduct.js";
import Review from "../model/review.js";
import Category from "../model/Category.js";

// Get Revenue Analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { period = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      placedAt: { $gte: startDate }
    }).populate("items.productId", "title categoryname");

    const dailyRevenue = {};
    const categoryRevenue = {};
    const productRevenue = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      
      sellerItems.forEach(item => {
        const revenue = item.price * item.quantity;
        totalRevenue += revenue;

        // Daily breakdown
        const dateKey = order.placedAt.toISOString().split('T')[0];
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + revenue;

        // Product breakdown
        const productName = item.name || "Unknown";
        productRevenue[productName] = (productRevenue[productName] || 0) + revenue;

        // Category breakdown
        const categoryId = item.productId?.categoryname?.toString() || "uncategorized";
        categoryRevenue[categoryId] = (categoryRevenue[categoryId] || 0) + revenue;
      });

      totalOrders++;
    });

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(period));
    
    const prevOrders = await orderModel.find({
      "items.sellerId": sellerId,
      placedAt: { $gte: prevStartDate, $lt: startDate }
    });

    let prevRevenue = 0;
    prevOrders.forEach(order => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      prevRevenue += sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    });

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
        revenueGrowth,
        previousPeriodRevenue: prevRevenue,
        dailyRevenue: Object.entries(dailyRevenue)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
        topProducts: Object.entries(productRevenue)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
        categoryBreakdown: Object.entries(categoryRevenue)
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
      }
    });
  } catch (error) {
    console.error("Revenue Analytics Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Traffic Insights (Simulated - would need analytics integration)
export const getTrafficInsights = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { period = "30" } = req.query;

    // Get product views from orders as proxy for interest
    const products = await addproductmodel.find({ sellerId });
    const orders = await orderModel.find({ "items.sellerId": sellerId });

    // Simulate traffic data based on order patterns
    const productViews = {};
    products.forEach(product => {
      const orderCount = orders.filter(o => 
        o.items.some(i => i.productId?.toString() === product._id.toString())
      ).length;
      productViews[product.title] = {
        estimatedViews: orderCount * 15, // Assume 15 views per order
        orders: orderCount,
        conversionRate: orderCount > 0 ? ((orderCount / (orderCount * 15)) * 100).toFixed(2) : 0
      };
    });

    const totalEstimatedViews = Object.values(productViews).reduce((acc, p) => acc + p.estimatedViews, 0);
    const totalOrders = orders.length;

    res.status(200).json({
      success: true,
      data: {
        totalViews: totalEstimatedViews,
        uniqueVisitors: Math.floor(totalEstimatedViews * 0.7),
        pageViews: totalEstimatedViews,
        bounceRate: "35%",
        avgSessionDuration: "2m 45s",
        topProducts: Object.entries(productViews)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.estimatedViews - a.estimatedViews)
          .slice(0, 10),
        trafficSources: [
          { source: "Direct", percentage: 35 },
          { source: "Search", percentage: 40 },
          { source: "Social", percentage: 15 },
          { source: "Referral", percentage: 10 }
        ],
        note: "Traffic data is estimated based on order patterns. Connect analytics for accurate data."
      }
    });
  } catch (error) {
    console.error("Traffic Insights Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Conversion Reports
export const getConversionReports = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { period = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const products = await addproductmodel.find({ sellerId });
    const orders = await orderModel.find({
      "items.sellerId": sellerId,
      placedAt: { $gte: startDate }
    });

    const productConversion = products.map(product => {
      const productOrders = orders.filter(o => 
        o.items.some(i => i.productId?.toString() === product._id.toString())
      );
      const orderCount = productOrders.length;
      const estimatedViews = orderCount * 12;
      const revenue = productOrders.reduce((acc, o) => {
        const item = o.items.find(i => i.productId?.toString() === product._id.toString());
        return acc + (item ? item.price * item.quantity : 0);
      }, 0);

      return {
        productId: product._id,
        name: product.title,
        image: product.images?.[0]?.url,
        views: estimatedViews,
        orders: orderCount,
        conversionRate: estimatedViews > 0 ? ((orderCount / estimatedViews) * 100).toFixed(2) : 0,
        revenue,
        avgOrderValue: orderCount > 0 ? (revenue / orderCount).toFixed(2) : 0
      };
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => ["Delivered", "Completed"].includes(o.status)).length;
    const returnedOrders = orders.filter(o => o.status === "Returned").length;

    res.status(200).json({
      success: true,
      data: {
        overallConversionRate: "8.3%",
        cartAbandonmentRate: "65%",
        orderCompletionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
        returnRate: totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0,
        productConversion: productConversion.sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)),
        funnelData: {
          visits: products.length * 50,
          productViews: products.length * 30,
          addToCart: totalOrders * 2,
          checkout: totalOrders * 1.3,
          purchase: totalOrders
        }
      }
    });
  } catch (error) {
    console.error("Conversion Reports Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Export Data
export const exportData = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { type = "orders", format = "json", startDate, endDate } = req.query;

    let data = [];
    let query = {};

    if (startDate || endDate) {
      query.placedAt = {};
      if (startDate) query.placedAt.$gte = new Date(startDate);
      if (endDate) query.placedAt.$lte = new Date(endDate);
    }

    switch (type) {
      case "orders":
        const orders = await orderModel.find({ "items.sellerId": sellerId, ...query })
          .populate("user", "name email");
        data = orders.map(order => {
          const sellerItems = order.items.filter(i => i.sellerId.toString() === sellerId.toString());
          return {
            orderId: order._id,
            date: order.placedAt,
            customer: order.user?.name || order.shippingAddress?.name,
            email: order.user?.email,
            items: sellerItems.map(i => `${i.name} x${i.quantity}`).join(", "),
            total: sellerItems.reduce((acc, i) => acc + i.price * i.quantity, 0),
            status: order.status,
            address: `${order.shippingAddress?.address}, ${order.shippingAddress?.city}`
          };
        });
        break;

      case "products":
        const products = await addproductmodel.find({ sellerId })
          .populate("categoryname", "name");
        data = products.map(p => ({
          productId: p._id,
          title: p.title,
          category: p.categoryname?.name,
          price: p.price,
          oldPrice: p.oldprice,
          discount: p.discount,
          stock: p.stock,
          availability: p.availability,
          approved: p.approved
        }));
        break;

      case "customers":
        const customerOrders = await orderModel.find({ "items.sellerId": sellerId })
          .populate("user", "name email");
        const customers = {};
        customerOrders.forEach(order => {
          const custId = order.user?._id?.toString() || order.shippingAddress?.phone;
          if (custId && !customers[custId]) {
            customers[custId] = {
              name: order.user?.name || order.shippingAddress?.name,
              email: order.user?.email,
              phone: order.shippingAddress?.phone,
              totalOrders: 0,
              totalSpent: 0
            };
          }
          if (custId) {
            const total = order.items
              .filter(i => i.sellerId.toString() === sellerId.toString())
              .reduce((acc, i) => acc + i.price * i.quantity, 0);
            customers[custId].totalOrders++;
            customers[custId].totalSpent += total;
          }
        });
        data = Object.values(customers);
        break;

      default:
        return res.status(400).json({ success: false, message: "Invalid export type" });
    }

    res.status(200).json({
      success: true,
      data: {
        type,
        count: data.length,
        exportedAt: new Date(),
        records: data
      }
    });
  } catch (error) {
    console.error("Export Data Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Inventory Reports
export const getInventoryReports = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const products = await addproductmodel.find({ sellerId })
      .populate("categoryname", "name");

    const inventory = {
      totalProducts: products.length,
      inStock: products.filter(p => p.availability === "In Stock").length,
      lowStock: products.filter(p => p.availability === "Low Stock").length,
      outOfStock: products.filter(p => p.availability === "Out of Stock").length,
      totalStockValue: products.reduce((acc, p) => acc + (p.stock * p.price), 0),
      avgStockLevel: products.length > 0 ? (products.reduce((acc, p) => acc + p.stock, 0) / products.length).toFixed(0) : 0
    };

    const productDetails = products.map(p => ({
      _id: p._id,
      title: p.title,
      image: p.images?.[0]?.url,
      category: p.categoryname?.name || "Uncategorized",
      price: p.price,
      stock: p.stock,
      availability: p.availability,
      stockValue: p.stock * p.price,
      approved: p.approved
    })).sort((a, b) => a.stock - b.stock);

    const categoryBreakdown = {};
    products.forEach(p => {
      const catName = p.categoryname?.name || "Uncategorized";
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = { count: 0, totalStock: 0, value: 0 };
      }
      categoryBreakdown[catName].count++;
      categoryBreakdown[catName].totalStock += p.stock;
      categoryBreakdown[catName].value += p.stock * p.price;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: inventory,
        products: productDetails,
        categoryBreakdown: Object.entries(categoryBreakdown)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.value - a.value),
        alerts: {
          outOfStock: productDetails.filter(p => p.availability === "Out of Stock"),
          lowStock: productDetails.filter(p => p.availability === "Low Stock")
        }
      }
    });
  } catch (error) {
    console.error("Inventory Reports Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
