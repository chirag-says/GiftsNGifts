import express from "express"
import authseller from "../middleware/authseller.js"
import { addproducts, getSeller, getSellerDashboardStats, getSellerOrders, getSellerProfile, loginseller, registerseller, updateSellerOrderStatus, updateSellerProfile, userlist } from "../controller/sellercontroller.js";
import upload from "../middleware/multer.js";

const sellerrouter=express.Router();

sellerrouter.post('/register',registerseller);
sellerrouter.post("/login",loginseller)
sellerrouter.post("/addproducts",upload.array('images', 5),authseller, addproducts)
// sellerrouter.get("/orders",authseller,sellerorders)
sellerrouter.get("/profile",authseller,getSellerProfile);
sellerrouter.post("/updateprofile",authseller,updateSellerProfile);
sellerrouter.get("/users-list",userlist);
sellerrouter.get("/sellerdetails",authseller,getSeller);
// Define GET /api/seller/orders route
sellerrouter.get("/orders",authseller, getSellerOrders);
sellerrouter.get('/dashboard-stats', authseller, getSellerDashboardStats);
sellerrouter.put("/orders/:orderId", authseller, updateSellerOrderStatus);
export default sellerrouter;