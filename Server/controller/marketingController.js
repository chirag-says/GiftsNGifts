import CouponModel from "../model/coupon.js";
import addproductmodel from "../model/addproduct.js";
import orderModel from "../model/order.js";

// Get My Promotions
export const getMyPromotions = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const coupons = await CouponModel.find({ sellerId }).sort({ createdAt: -1 });

    const activePromotions = coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date());
    const expiredPromotions = coupons.filter(c => new Date(c.validUntil) <= new Date());

    // Get products with discounts
    const discountedProducts = await addproductmodel.find({
      sellerId,
      discount: { $gt: 0 }
    });

    res.status(200).json({
      success: true,
      data: {
        coupons,
        activeCount: activePromotions.length,
        expiredCount: expiredPromotions.length,
        discountedProducts: discountedProducts.length,
        totalRedemptions: coupons.reduce((acc, c) => acc + c.usedCount, 0)
      }
    });
  } catch (error) {
    console.error("My Promotions Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const { 
      sellerId, 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      applicableProducts,
      applicableCategories
    } = req.body;

    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if code exists
    const existing = await CouponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new CouponModel({
      sellerId,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount,
      usageLimit,
      validFrom: validFrom || new Date(),
      validUntil,
      applicableProducts,
      applicableCategories
    });

    await coupon.save();

    res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { sellerId, couponId, ...updateData } = req.body;

    const coupon = await CouponModel.findOne({ _id: couponId, sellerId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    Object.assign(coupon, updateData);
    await coupon.save();

    res.status(200).json({ success: true, message: "Coupon updated", coupon });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { couponId } = req.params;

    const coupon = await CouponModel.findOneAndDelete({ _id: couponId, sellerId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Discount Manager Data
export const getDiscountManager = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const products = await addproductmodel.find({ sellerId });

    const discountedProducts = products.filter(p => p.discount > 0);
    const fullPriceProducts = products.filter(p => p.discount === 0);

    const discountRanges = {
      "0-10%": discountedProducts.filter(p => p.discount <= 10).length,
      "11-25%": discountedProducts.filter(p => p.discount > 10 && p.discount <= 25).length,
      "26-50%": discountedProducts.filter(p => p.discount > 25 && p.discount <= 50).length,
      "51%+": discountedProducts.filter(p => p.discount > 50).length
    };

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        discountedCount: discountedProducts.length,
        fullPriceCount: fullPriceProducts.length,
        avgDiscount: discountedProducts.length > 0 
          ? (discountedProducts.reduce((acc, p) => acc + p.discount, 0) / discountedProducts.length).toFixed(1) 
          : 0,
        discountRanges,
        products: products.map(p => ({
          _id: p._id,
          title: p.title,
          image: p.images?.[0]?.url,
          price: p.price,
          oldPrice: p.oldprice,
          discount: p.discount,
          stock: p.stock
        })).sort((a, b) => b.discount - a.discount)
      }
    });
  } catch (error) {
    console.error("Discount Manager Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Product Discount
export const updateProductDiscount = async (req, res) => {
  try {
    const { sellerId, productId, discount, price, oldPrice } = req.body;

    const product = await addproductmodel.findOne({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (discount !== undefined) product.discount = discount;
    if (price !== undefined) product.price = price;
    if (oldPrice !== undefined) product.oldprice = oldPrice;

    await product.save();

    res.status(200).json({ success: true, message: "Discount updated", product });
  } catch (error) {
    console.error("Update Product Discount Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Featured Products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const products = await addproductmodel.find({ sellerId })
      .populate("categoryname", "name");

    // For now, featured products are those with high stock and approved status
    const featured = products.filter(p => p.approved && p.stock > 10);

    res.status(200).json({
      success: true,
      data: {
        featuredProducts: featured.map(p => ({
          _id: p._id,
          title: p.title,
          image: p.images?.[0]?.url,
          category: p.categoryname?.name,
          price: p.price,
          stock: p.stock,
          isFeatured: true
        })),
        allProducts: products.map(p => ({
          _id: p._id,
          title: p.title,
          image: p.images?.[0]?.url,
          category: p.categoryname?.name,
          price: p.price,
          stock: p.stock,
          approved: p.approved
        }))
      }
    });
  } catch (error) {
    console.error("Featured Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Seasonal Offers
export const getSeasonalOffers = async (req, res) => {
  try {
    const { sellerId } = req.body;

    // Get coupons that are seasonal/time-limited
    const coupons = await CouponModel.find({
      sellerId,
      validUntil: { $gte: new Date() }
    });

    const products = await addproductmodel.find({
      sellerId,
      discount: { $gte: 20 } // Products with 20%+ discount are considered seasonal offers
    });

    res.status(200).json({
      success: true,
      data: {
        activeCoupons: coupons,
        seasonalProducts: products.map(p => ({
          _id: p._id,
          title: p.title,
          image: p.images?.[0]?.url,
          price: p.price,
          oldPrice: p.oldprice,
          discount: p.discount
        })),
        suggestions: [
          { name: "Holiday Sale", description: "Create discounts for upcoming holidays" },
          { name: "Flash Sale", description: "Limited time offers drive urgency" },
          { name: "Bundle Deals", description: "Combine products for better value" }
        ]
      }
    });
  } catch (error) {
    console.error("Seasonal Offers Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Marketing Budget
export const getMarketingBudget = async (req, res) => {
  try {
    const { sellerId } = req.body;

    // This would integrate with actual ad/marketing platform
    // For now, return placeholder data
    res.status(200).json({
      success: true,
      data: {
        totalBudget: 0,
        spent: 0,
        remaining: 0,
        campaigns: [],
        recommendations: [
          { type: "Sponsored Products", description: "Boost visibility for top products" },
          { type: "Store Ads", description: "Promote your entire store" },
          { type: "Category Ads", description: "Target specific category shoppers" }
        ],
        note: "Marketing campaigns coming soon"
      }
    });
  } catch (error) {
    console.error("Marketing Budget Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Promotional Tools
export const getPromotionalTools = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const products = await addproductmodel.find({ sellerId });
    const coupons = await CouponModel.find({ sellerId });

    res.status(200).json({
      success: true,
      data: {
        availableTools: [
          { 
            name: "Coupons", 
            description: "Create discount codes for customers",
            active: coupons.length,
            icon: "ticket"
          },
          { 
            name: "Flash Sales", 
            description: "Time-limited discounts",
            active: 0,
            icon: "bolt"
          },
          { 
            name: "Bundle Offers", 
            description: "Combine products at special prices",
            active: 0,
            icon: "package"
          },
          { 
            name: "Free Shipping", 
            description: "Offer free shipping on orders",
            active: 0,
            icon: "truck"
          }
        ],
        productCount: products.length,
        activePromotions: coupons.filter(c => c.isActive).length
      }
    });
  } catch (error) {
    console.error("Promotional Tools Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
