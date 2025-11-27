import React, { useState, createContext } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Slide } from '@mui/material';
import { IoMdClose } from "react-icons/io";

// Pages & Components
import Header from './Components/Header/Header.jsx';
import SideBar from './Components/Sidebar/SideBar.jsx';
import DashBoard from './Pages/DashBoard/DashBoard.jsx';
import ProductList from './Pages/Product Pages/ProductList.jsx';
import ActiveProducts from './Pages/Product Pages/ActiveProducts.jsx';
import DraftProducts from './Pages/Product Pages/DraftProducts.jsx';
import OutOfStockProducts from './Pages/Product Pages/OutOfStockProducts.jsx';
import ProductReviews from './Pages/Product Pages/ProductReviews.jsx';
import AddProduct from './Pages/Product Pages/AddProduct.jsx';
import OrdersList from './Pages/Orders Pages/OrdersList.jsx';
import CategoryList from './Pages/Category/CategoryList.jsx';
import AddCategory from './Pages/Category/AddCategory.jsx';
import SubCategoryList from './Pages/Category/SubCategoryList.jsx';
import AddSubCategory from './Pages/Category/AddSubCategory.jsx';
import SellerProfile from './Pages/Seller Profile/SellerProfile.jsx';
import Login from './Pages/Login/Login.jsx';
import ProtectedRoute from './Pages/ProtectedRoute.jsx';

// Reports & Communication
import ProductPerformance from './Pages/Reports/ProductPerformance.jsx';
import AdminMessages from './Pages/Communication/AdminMessages.jsx';
import SupportTickets from './Pages/Communication/SupportTickets.jsx';
import Notifications from './Pages/Communication/Notifications.jsx';
import ChatCustomers from './Pages/Communication/ChatCustomers.jsx';
import EmailResponses from './Pages/Communication/EmailResponses.jsx';

// Finance & Payments
import PendingPayments from './Pages/Finance/PendingPayments.jsx';
import TransactionHistory from './Pages/Finance/TransactionHistory.jsx';
import PayoutRequests from './Pages/Finance/PayoutRequests.jsx';
import CommissionDetails from './Pages/Finance/CommissionDetails.jsx';
import BankDetails from './Pages/Finance/BankDetails.jsx';
import Invoices from './Pages/Finance/Invoices.jsx';
import Earnings from './Pages/Payments/Earnings.jsx';
import Refunds from './Pages/Payments/Refunds.jsx';
import PaymentSummary from './Pages/Payments/PaymentSummary.jsx';
import Settlements from './Pages/Payments/Settlements.jsx';

// Customers
import MyCustomers from './Pages/Customers/MyCustomers.jsx';
import OrderHistory from './Pages/Customers/OrderHistory.jsx';
import CustomerReviews from './Pages/Customers/CustomerReviews.jsx';
import WishlistInsights from './Pages/Customers/WishlistInsights.jsx';
import CustomerMessages from './Pages/Customers/CustomerMessages.jsx';
import LoyaltyProgram from './Pages/Customers/LoyaltyProgram.jsx';

// Store
import StoreSettings from './Pages/Store/StoreSettings.jsx';
import BusinessInfo from './Pages/Store/BusinessInfo.jsx';
import StoreCustomization from './Pages/Store/StoreCustomization.jsx';
import HolidayMode from './Pages/Store/HolidayMode.jsx';
import StorePerformance from './Pages/Store/StorePerformance.jsx';
import VerificationStatus from './Pages/Store/VerificationStatus.jsx';

// Analytics
import RevenueAnalytics from './Pages/Analytics/RevenueAnalytics.jsx';
import TrafficInsights from './Pages/Analytics/TrafficInsights.jsx';
import ConversionReports from './Pages/Analytics/ConversionReports.jsx';
import InventoryReports from './Pages/Analytics/InventoryReports.jsx';
import ExportData from './Pages/Analytics/ExportData.jsx';

// Categories
import MyCategories from './Pages/Categories/MyCategories.jsx';
import CategoryPerformance from './Pages/Categories/CategoryPerformance.jsx';
import CategorySuggestions from './Pages/Categories/CategorySuggestions.jsx';

// Marketing
import MyPromotions from './Pages/Marketing/MyPromotions.jsx';
import DiscountManager from './Pages/Marketing/DiscountManager.jsx';
import FeaturedProducts from './Pages/Marketing/FeaturedProducts.jsx';
import SeasonalOffers from './Pages/Marketing/SeasonalOffers.jsx';
import MarketingBudget from './Pages/Marketing/MarketingBudget.jsx';
import PromotionalTools from './Pages/Marketing/PromotionalTools.jsx';

// Shipping
import ShippingSettings from './Pages/Shipping/ShippingSettings.jsx';
import DeliveryPartners from './Pages/Shipping/DeliveryPartners.jsx';
import ShippingRates from './Pages/Shipping/ShippingRates.jsx';
import PackageDimensions from './Pages/Shipping/PackageDimensions.jsx';
import TrackingOrders from './Pages/Shipping/TrackingOrders.jsx';
import PickupSchedule from './Pages/Shipping/PickupSchedule.jsx';
import ReturnAddress from './Pages/Shipping/ReturnAddress.jsx';

// Reviews
import MyReviews from './Pages/Reviews/MyReviews.jsx';
import StoreReviews from './Pages/Reviews/StoreReviews.jsx';
import RespondToReviews from './Pages/Reviews/RespondToReviews.jsx';
import ReviewRequests from './Pages/Reviews/ReviewRequests.jsx';
import RatingInsights from './Pages/Reviews/RatingInsights.jsx';
import ProductReviewsPage from './Pages/Reviews/ProductReviews.jsx';

// Personalization
import PersonalizationOptions from './Pages/Personalization/PersonalizationOptions.jsx';
import GiftWrapping from './Pages/Personalization/GiftWrapping.jsx';
import GreetingCards from './Pages/Personalization/GreetingCards.jsx';
import CustomMessages from './Pages/Personalization/CustomMessages.jsx';
import AddOnServices from './Pages/Personalization/AddOnServices.jsx';
import BulkPersonalization from './Pages/Personalization/BulkPersonalization.jsx';
import CustomPricing from './Pages/Personalization/CustomPricing.jsx';

export const MyContext = createContext();
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Layout({ children }) {
  return (
    <section className="main h-screen w-full flex flex-col">
      <Header /> {/* Full width header */}
      <div className="flex w-full overflow-auto">
        <aside>
          <SideBar />
        </aside>
        <main className="!w-[100%] py-2 overflow-y-auto ">
          {children}
        </main>
      </div>
    </section>
  );
}

function App() {
  const [isOpenAddProductPanel, setIsOpenAddProductPanel] = useState({
    open: false,
    model: ''
  });
  const values = {
    isOpenAddProductPanel,
    setIsOpenAddProductPanel
  };
  const router = createBrowserRouter([
    { path: '/', element: <ProtectedRoute><Layout><DashBoard /></Layout></ProtectedRoute> },
    { path: '/login', element: <Login /> },
    { path: '/products', element: <ProtectedRoute><Layout><ProductList /></Layout></ProtectedRoute> },
    { path: '/products/active', element: <ProtectedRoute><Layout><ActiveProducts /></Layout></ProtectedRoute> },
    { path: '/products/drafts', element: <ProtectedRoute><Layout><DraftProducts /></Layout></ProtectedRoute> },
    { path: '/products/out-of-stock', element: <ProtectedRoute><Layout><OutOfStockProducts /></Layout></ProtectedRoute> },
    { path: '/products/reviews', element: <ProtectedRoute><Layout><ProductReviews /></Layout></ProtectedRoute> },
    { path: '/orders', element: <ProtectedRoute><Layout><OrdersList /></Layout></ProtectedRoute> },
    { path: '/orders/today', element: <ProtectedRoute><Layout><OrdersList focusedRange="today" /></Layout></ProtectedRoute> },
    { path: '/orders/month', element: <ProtectedRoute><Layout><OrdersList focusedRange="month" /></Layout></ProtectedRoute> },
    { path: '/orders/year', element: <ProtectedRoute><Layout><OrdersList focusedRange="year" /></Layout></ProtectedRoute> },
    { path: '/orders/overall', element: <ProtectedRoute><Layout><OrdersList focusedRange="overall" /></Layout></ProtectedRoute> },
    { path: '/orders/new', element: <ProtectedRoute><Layout><OrdersList statusKey="new" /></Layout></ProtectedRoute> },
    { path: '/orders/processing', element: <ProtectedRoute><Layout><OrdersList statusKey="processing" /></Layout></ProtectedRoute> },
    { path: '/orders/ready-to-ship', element: <ProtectedRoute><Layout><OrdersList statusKey="readyToShip" /></Layout></ProtectedRoute> },
    { path: '/orders/shipped', element: <ProtectedRoute><Layout><OrdersList statusKey="shipped" /></Layout></ProtectedRoute> },
    { path: '/orders/completed', element: <ProtectedRoute><Layout><OrdersList statusKey="completed" /></Layout></ProtectedRoute> },
    { path: '/orders/returns', element: <ProtectedRoute><Layout><OrdersList statusKey="returns" /></Layout></ProtectedRoute> },
    { path: '/orders/labels', element: <ProtectedRoute><Layout><OrdersList statusKey="labels" /></Layout></ProtectedRoute> },
    { path: '/categorylist', element: <ProtectedRoute><Layout><CategoryList /></Layout></ProtectedRoute> },
    { path: '/subcategorylist', element: <ProtectedRoute><Layout><SubCategoryList /></Layout></ProtectedRoute> },
    { path: '/seller-profile', element: <ProtectedRoute><Layout><SellerProfile /></Layout></ProtectedRoute> },
    
    // Reports
    { path: '/reports/product-performance', element: <ProtectedRoute><Layout><ProductPerformance /></Layout></ProtectedRoute> },
    
    // Communication
    { path: '/communication/admin-messages', element: <ProtectedRoute><Layout><AdminMessages /></Layout></ProtectedRoute> },
    { path: '/communication/support-tickets', element: <ProtectedRoute><Layout><SupportTickets /></Layout></ProtectedRoute> },
    { path: '/communication/notifications', element: <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute> },
    { path: '/communication/chat-customers', element: <ProtectedRoute><Layout><ChatCustomers /></Layout></ProtectedRoute> },
    { path: '/communication/email-responses', element: <ProtectedRoute><Layout><EmailResponses /></Layout></ProtectedRoute> },

    // Payments & Finance
    { path: '/payments/earnings', element: <ProtectedRoute><Layout><Earnings /></Layout></ProtectedRoute> },
    { path: '/payments/pending', element: <ProtectedRoute><Layout><PendingPayments /></Layout></ProtectedRoute> },
    { path: '/payments/transactions', element: <ProtectedRoute><Layout><TransactionHistory /></Layout></ProtectedRoute> },
    { path: '/payments/payouts', element: <ProtectedRoute><Layout><PayoutRequests /></Layout></ProtectedRoute> },
    { path: '/payments/commission', element: <ProtectedRoute><Layout><CommissionDetails /></Layout></ProtectedRoute> },
    { path: '/payments/bank-details', element: <ProtectedRoute><Layout><BankDetails /></Layout></ProtectedRoute> },
    { path: '/payments/invoices', element: <ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute> },
    { path: '/payments/refunds', element: <ProtectedRoute><Layout><Refunds /></Layout></ProtectedRoute> },
    { path: '/payments/summary', element: <ProtectedRoute><Layout><PaymentSummary /></Layout></ProtectedRoute> },
    { path: '/payments/settlements', element: <ProtectedRoute><Layout><Settlements /></Layout></ProtectedRoute> },

    // Customers
    { path: '/customers', element: <ProtectedRoute><Layout><MyCustomers /></Layout></ProtectedRoute> },
    { path: '/customers/orders', element: <ProtectedRoute><Layout><OrderHistory /></Layout></ProtectedRoute> },
    { path: '/customers/reviews', element: <ProtectedRoute><Layout><CustomerReviews /></Layout></ProtectedRoute> },
    { path: '/customers/wishlist', element: <ProtectedRoute><Layout><WishlistInsights /></Layout></ProtectedRoute> },
    { path: '/customers/messages', element: <ProtectedRoute><Layout><CustomerMessages /></Layout></ProtectedRoute> },
    { path: '/customers/loyalty', element: <ProtectedRoute><Layout><LoyaltyProgram /></Layout></ProtectedRoute> },

    // Store
    { path: '/store/settings', element: <ProtectedRoute><Layout><StoreSettings /></Layout></ProtectedRoute> },
    { path: '/store/business-info', element: <ProtectedRoute><Layout><BusinessInfo /></Layout></ProtectedRoute> },
    { path: '/store/customization', element: <ProtectedRoute><Layout><StoreCustomization /></Layout></ProtectedRoute> },
    { path: '/store/holiday-mode', element: <ProtectedRoute><Layout><HolidayMode /></Layout></ProtectedRoute> },
    { path: '/store/performance', element: <ProtectedRoute><Layout><StorePerformance /></Layout></ProtectedRoute> },
    { path: '/store/verification', element: <ProtectedRoute><Layout><VerificationStatus /></Layout></ProtectedRoute> },

    // Analytics
    { path: '/analytics/revenue', element: <ProtectedRoute><Layout><RevenueAnalytics /></Layout></ProtectedRoute> },
    { path: '/analytics/traffic', element: <ProtectedRoute><Layout><TrafficInsights /></Layout></ProtectedRoute> },
    { path: '/analytics/conversion', element: <ProtectedRoute><Layout><ConversionReports /></Layout></ProtectedRoute> },
    { path: '/analytics/inventory', element: <ProtectedRoute><Layout><InventoryReports /></Layout></ProtectedRoute> },
    { path: '/analytics/export', element: <ProtectedRoute><Layout><ExportData /></Layout></ProtectedRoute> },

    // Categories
    { path: '/categories/my', element: <ProtectedRoute><Layout><MyCategories /></Layout></ProtectedRoute> },
    { path: '/categories/performance', element: <ProtectedRoute><Layout><CategoryPerformance /></Layout></ProtectedRoute> },
    { path: '/categories/suggestions', element: <ProtectedRoute><Layout><CategorySuggestions /></Layout></ProtectedRoute> },

    // Marketing
    { path: '/marketing/promotions', element: <ProtectedRoute><Layout><MyPromotions /></Layout></ProtectedRoute> },
    { path: '/marketing/discounts', element: <ProtectedRoute><Layout><DiscountManager /></Layout></ProtectedRoute> },
    { path: '/marketing/featured', element: <ProtectedRoute><Layout><FeaturedProducts /></Layout></ProtectedRoute> },
    { path: '/marketing/seasonal', element: <ProtectedRoute><Layout><SeasonalOffers /></Layout></ProtectedRoute> },
    { path: '/marketing/budget', element: <ProtectedRoute><Layout><MarketingBudget /></Layout></ProtectedRoute> },
    { path: '/marketing/tools', element: <ProtectedRoute><Layout><PromotionalTools /></Layout></ProtectedRoute> },

    // Shipping
    { path: '/shipping/settings', element: <ProtectedRoute><Layout><ShippingSettings /></Layout></ProtectedRoute> },
    { path: '/shipping/partners', element: <ProtectedRoute><Layout><DeliveryPartners /></Layout></ProtectedRoute> },
    { path: '/shipping/rates', element: <ProtectedRoute><Layout><ShippingRates /></Layout></ProtectedRoute> },
    { path: '/shipping/dimensions', element: <ProtectedRoute><Layout><PackageDimensions /></Layout></ProtectedRoute> },
    { path: '/shipping/tracking', element: <ProtectedRoute><Layout><TrackingOrders /></Layout></ProtectedRoute> },
    { path: '/shipping/pickup', element: <ProtectedRoute><Layout><PickupSchedule /></Layout></ProtectedRoute> },
    { path: '/shipping/return-address', element: <ProtectedRoute><Layout><ReturnAddress /></Layout></ProtectedRoute> },

    // Reviews
    { path: '/reviews', element: <ProtectedRoute><Layout><MyReviews /></Layout></ProtectedRoute> },
    { path: '/reviews/products', element: <ProtectedRoute><Layout><ProductReviewsPage /></Layout></ProtectedRoute> },
    { path: '/reviews/store', element: <ProtectedRoute><Layout><StoreReviews /></Layout></ProtectedRoute> },
    { path: '/reviews/respond', element: <ProtectedRoute><Layout><RespondToReviews /></Layout></ProtectedRoute> },
    { path: '/reviews/requests', element: <ProtectedRoute><Layout><ReviewRequests /></Layout></ProtectedRoute> },
    { path: '/reviews/insights', element: <ProtectedRoute><Layout><RatingInsights /></Layout></ProtectedRoute> },

    // Personalization
    { path: '/personalization/options', element: <ProtectedRoute><Layout><PersonalizationOptions /></Layout></ProtectedRoute> },
    { path: '/personalization/gift-wrapping', element: <ProtectedRoute><Layout><GiftWrapping /></Layout></ProtectedRoute> },
    { path: '/personalization/greeting-cards', element: <ProtectedRoute><Layout><GreetingCards /></Layout></ProtectedRoute> },
    { path: '/personalization/messages', element: <ProtectedRoute><Layout><CustomMessages /></Layout></ProtectedRoute> },
    { path: '/personalization/addons', element: <ProtectedRoute><Layout><AddOnServices /></Layout></ProtectedRoute> },
    { path: '/personalization/bulk', element: <ProtectedRoute><Layout><BulkPersonalization /></Layout></ProtectedRoute> },
    { path: '/personalization/pricing', element: <ProtectedRoute><Layout><CustomPricing /></Layout></ProtectedRoute> },
  ]);

  return (
    <MyContext.Provider value={values}>
      <RouterProvider router={router} />
      {/* Dialog for Add Forms */}
      <Dialog
        fullScreen
        open={isOpenAddProductPanel.open}
        onClose={() => setIsOpenAddProductPanel({ open: false })}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }} className="!bg-white !shadow-md !py-4">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsOpenAddProductPanel({ open: false })}
              aria-label="close"
            >
              <IoMdClose className="text-gray-800 text-[18px]" />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              <span className="text-gray-800">{isOpenAddProductPanel?.model}</span>
            </Typography>
          </Toolbar>
        </AppBar>
        {isOpenAddProductPanel?.model === 'Add Product' && <AddProduct />}
        {isOpenAddProductPanel?.model === 'Add New Category' && <AddCategory />}
        {isOpenAddProductPanel?.model === 'Add New Sub Category' && <AddSubCategory />}
      </Dialog>
    </MyContext.Provider>
  );
}

export default App;