import express from "express";
import authseller from "../middleware/authseller.js";
import { 
  addproducts, 
  getSeller, 
  getSellerDashboardStats, 
  getSellerOrders, 
  getSellerProfile, 
  loginseller, 
  registerseller, 
  updateSellerOrderStatus, 
  updateSellerProfile, 
  userlist,
  getSellerEarnings,   // Import
  getSellerCustomers   // Import
} from "../controller/sellercontroller.js";
import upload from "../middleware/multer.js";

const sellerrouter = express.Router();

sellerrouter.post('/register', registerseller);
sellerrouter.post("/login", loginseller);
sellerrouter.post("/addproducts", upload.array('images', 5), authseller, addproducts);

sellerrouter.get("/profile", authseller, getSellerProfile);
sellerrouter.post("/updateprofile", authseller, updateSellerProfile);
sellerrouter.get("/users-list", userlist);
sellerrouter.get("/sellerdetails", authseller, getSeller);

// Orders
sellerrouter.get("/orders", authseller, getSellerOrders);
sellerrouter.get('/dashboard-stats', authseller, getSellerDashboardStats);
sellerrouter.put("/orders/:orderId", authseller, updateSellerOrderStatus);

// --- NEW ROUTES ---
sellerrouter.get("/finance/earnings", authseller, getSellerEarnings);
sellerrouter.get("/customers/my-customers", authseller, getSellerCustomers);

export default sellerrouter;