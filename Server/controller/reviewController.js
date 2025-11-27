import Review from "../model/review.js";
import addproductmodel from "../model/addproduct.js";
import orderModel from "../model/order.js";

// Get My Reviews (All reviews for seller's products)
export const getMyReviews = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { page = 1, limit = 20, rating, responded } = req.query;

    const products = await addproductmodel.find({ sellerId });
    const productIds = products.map(p => p._id);

    let query = { productId: { $in: productIds } };
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate("productId", "title images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments(query);
    const allReviews = await Review.find({ productId: { $in: productIds } });

    const stats = {
      total: allReviews.length,
      average: allReviews.length > 0 
        ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1) 
        : 0,
      distribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length
      },
      responded: 0,
      pending: allReviews.length
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount
        }
      }
    });
  } catch (error) {
    console.error("My Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Product Reviews (Specific product)
export const getProductReviewsForSeller = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { productId } = req.query;

    // Verify product belongs to seller
    const product = await addproductmodel.findOne({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 });

    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        product: {
          _id: product._id,
          title: product.title,
          image: product.images?.[0]?.url
        },
        reviews,
        stats
      }
    });
  } catch (error) {
    console.error("Product Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Store Reviews (Aggregate of all product reviews)
export const getStoreReviews = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const products = await addproductmodel.find({ sellerId });
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({ productId: { $in: productIds } })
      .populate("productId", "title images");

    // Group by month
    const monthlyReviews = {};
    reviews.forEach(review => {
      const monthKey = new Date(review.createdAt).toISOString().slice(0, 7);
      if (!monthlyReviews[monthKey]) {
        monthlyReviews[monthKey] = { count: 0, totalRating: 0 };
      }
      monthlyReviews[monthKey].count++;
      monthlyReviews[monthKey].totalRating += review.rating;
    });

    const monthlyData = Object.entries(monthlyReviews)
      .map(([month, data]) => ({
        month,
        count: data.count,
        avgRating: (data.totalRating / data.count).toFixed(1)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate store rating
    const storeRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        storeRating,
        totalReviews: reviews.length,
        totalProducts: products.length,
        reviewedProducts: [...new Set(reviews.map(r => r.productId?._id?.toString()))].length,
        recentReviews: reviews.slice(0, 10),
        monthlyTrend: monthlyData,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length
        }
      }
    });
  } catch (error) {
    console.error("Store Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Respond to Review (placeholder - would need response field in review model)
export const respondToReview = async (req, res) => {
  try {
    const { sellerId, reviewId, response } = req.body;

    const review = await Review.findById(reviewId).populate("productId", "sellerId");
    
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // For now, just return success - would need to add response field to review model
    res.status(200).json({ 
      success: true, 
      message: "Response submitted",
      note: "Response functionality requires updating the review model"
    });
  } catch (error) {
    console.error("Respond to Review Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Review Requests (Customers who haven't reviewed their purchases)
export const getReviewRequests = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const completedOrders = await orderModel.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Completed"] }
    }).populate("user", "name email");

    const products = await addproductmodel.find({ sellerId });
    const productIds = products.map(p => p._id.toString());

    const reviews = await Review.find({ productId: { $in: productIds } });
    const reviewedProducts = new Set(reviews.map(r => `${r.productId}-${r.userName}`));

    const pendingReviewRequests = [];

    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId.toString() === sellerId.toString()) {
          const key = `${item.productId}-${order.user?.name || order.shippingAddress?.name}`;
          if (!reviewedProducts.has(key)) {
            pendingReviewRequests.push({
              orderId: order._id,
              productId: item.productId,
              productName: item.name,
              customer: order.user?.name || order.shippingAddress?.name,
              email: order.user?.email,
              orderDate: order.placedAt,
              daysSinceDelivery: Math.floor((Date.now() - order.placedAt) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        pendingRequests: pendingReviewRequests.slice(0, 50),
        totalPending: pendingReviewRequests.length,
        totalReviewed: reviews.length
      }
    });
  } catch (error) {
    console.error("Review Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Rating Insights
export const getRatingInsights = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { period = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const products = await addproductmodel.find({ sellerId });
    const productIds = products.map(p => p._id);

    const allReviews = await Review.find({ productId: { $in: productIds } })
      .populate("productId", "title images");

    const periodReviews = allReviews.filter(r => new Date(r.createdAt) >= startDate);

    // Product performance
    const productRatings = {};
    allReviews.forEach(review => {
      const prodId = review.productId?._id?.toString();
      if (prodId) {
        if (!productRatings[prodId]) {
          productRatings[prodId] = {
            product: review.productId,
            ratings: [],
            count: 0
          };
        }
        productRatings[prodId].ratings.push(review.rating);
        productRatings[prodId].count++;
      }
    });

    const topRated = Object.values(productRatings)
      .map(p => ({
        ...p,
        avgRating: p.ratings.length > 0 
          ? (p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length).toFixed(1) 
          : 0
      }))
      .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));

    const overallAvg = allReviews.length > 0 
      ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1) 
      : 0;

    const periodAvg = periodReviews.length > 0 
      ? (periodReviews.reduce((acc, r) => acc + r.rating, 0) / periodReviews.length).toFixed(1) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overallRating: overallAvg,
        periodRating: periodAvg,
        totalReviews: allReviews.length,
        periodReviews: periodReviews.length,
        topRatedProducts: topRated.slice(0, 5),
        lowestRatedProducts: topRated.slice(-5).reverse(),
        ratingTrend: periodAvg >= overallAvg ? "improving" : "declining",
        insights: [
          periodReviews.length > 0 
            ? `You received ${periodReviews.length} new reviews in the last ${period} days`
            : "No new reviews in the selected period",
          parseFloat(periodAvg) >= 4 
            ? "Great job! Your recent ratings are excellent"
            : parseFloat(periodAvg) >= 3 
              ? "Good ratings, but there's room for improvement"
              : "Focus on improving product quality and customer service"
        ]
      }
    });
  } catch (error) {
    console.error("Rating Insights Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
