import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import ordermodel from "../model/ordermodel.js";
import validator from "validator"
import sellermodel from "../model/sellermodel.js";
import addproductmodel from "../model/addproduct.js";
import {v2 as cloudinary} from "cloudinary"
import orderModel from "../model/order.js";
import usermodel from "../model/mongobd_usermodel.js";



export const userlist=async(req,res)=>{
  try{
     const users=await usermodel.find() ;
     if(!users){
      return res.json({success:false,message:"no users found"});
     }
     return res.json({success:true,users});
  }

  catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const registerseller=async(req,res)=>{
try{
  const {name,email,password,nickName}=req.body

  if(!name || !password || !email || !nickName){
  return res.json({success:false,message:"Missing Details"})
  }
  
  if(!validator.isEmail(email)){
    return res.json({success:false,message:"Enter a valid email"})
  }
  const existing =await sellermodel.findOne({email})
  if(existing){
    return res.json({success:false,message:"user allready exists"})
  }
  if (password.length<8){
    return res.json({success:false,message:"enter a strong password"})
  }

  const salt =await bcrypt.genSalt(10)
  const hashedpass=await bcrypt.hash(password,salt)
  
  const sellerdata={
    name,email,
    password:hashedpass,
    nickName
  }
  
  const newseller=new sellermodel(sellerdata)
  const seller=await newseller.save()
  
  const token=jwt.sign({id:seller._id},process.env.JWT_SECRET)
  return res.json({success:true,token,message:"registered succesfuly",name:name})
 }
catch(e){
   console.log(e)
 return   res.json({success:false,message:e.message})
}


}

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
          name: seller.name, // ✅ Send name here
          email: seller.email, // optional if you want
          id: seller._id,
          nickName:seller.nickName      // optional if needed
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

export const addproducts = async (req, res) => {
  try {
    console.log("body:", req.body);

    const { title, description, price, categoryname ,subcategory,oldprice,discount,ingredients,brand,additional_details,size,sellerId} = req.body;
    console.log(sellerId)
    const files = req.files;

    console.log("files:", req.files);

    if (!title || !description || !price || !categoryname || !subcategory || !oldprice || !discount  || !sellerId) 
      {
      return res.status(400).json({ message: 'Please provide all required fields with images.' });
    }

    // Upload each image to Cloudinary
    const uploadedImages = await Promise.all(
      files.map(file =>
        cloudinary.uploader.upload(file.path, { resource_type: "image" })
      )
    );

    // Extract only secure URLs
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
      subcategory,oldprice,
      discount,ingredients,
      brand,additional_details,
      size,sellerId
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success:true,
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

export const getSellerProfile = async (req, res) => {
  try {
    console.log("p")
    const {sellerId } = req.body;
    
    let seller = await sellermodel.findById(sellerId);

    if (seller) {
      
        console.log("s",seller)
      return res.status(200).json({success:true , seller });
  
    } 
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const updateSellerProfile = async (req, res) => {
  try {
    const { sellerId, name, email, phone } = req.body;

    // Find the seller by ID
    
    let seller = await sellermodel.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Update the seller's fields
    seller.name = name || seller.name;
    seller.email = email || seller.email;
    seller.phone = phone || seller.phone;

    // Save the updated seller
    await seller.save();

    return res.status(200).json({ sucess: true, message: "Profile updated successfully", seller });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
      return res.status(404).json({ message: "No orders found for this seller." });
    }

    // Optional: filter out only relevant items for that seller
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
    
    res.status(200).json({success:true,filteredOrders});
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getSeller=async(req,res)=>{

  const {sellerId}=req.body
console.log("i",sellerId)
  const seller=await sellermodel.find({ _id: sellerId})

  if(!seller.length){
    return res.status(404).json({message:"seller not found"})

  }

  return res.status(200).json({success:true,seller});

}

 // controller/dashboardController.js

export const getSellerDashboardStats = async (req, res) => {
  try {
    const { sellerId } = req.body;

    // Get seller's products
    const products = await addproductmodel.find({ sellerId });

    // Get all orders where this seller's product exists
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

    totalRevenue = totalSales; // You can subtract expenses or fees here

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

// controllers/sellerController.js

export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.sellerId || req.body.sellerId; // From token or body

    // Find order containing this seller
    const order = await orderModel.findOne({ 
      _id: orderId, 
      "items.sellerId": sellerId 
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for this seller" });
    }

    // Update only relevant items for this seller
    order.items.forEach((item) => {
      if (item.sellerId.toString() === sellerId.toString()) {
        item.status = status; // Optional per-item status
      }
    });

    // Optionally set global order status
    order.status = status;

    await order.save();

    return res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
