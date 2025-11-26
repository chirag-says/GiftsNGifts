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

// NEW: Import reports and communication pages
import ProductPerformance from './Pages/Reports/ProductPerformance.jsx';
import AdminMessages from './Pages/Communication/AdminMessages.jsx';
import SupportTickets from './Pages/Communication/SupportTickets.jsx';
import Notifications from './Pages/Communication/Notifications.jsx';
import ChatCustomers from './Pages/Communication/ChatCustomers.jsx';
import EmailResponses from './Pages/Communication/EmailResponses.jsx';

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
    // Report route
    { path: '/reports/product-performance', element: <ProtectedRoute><Layout><ProductPerformance /></Layout></ProtectedRoute> },
    // Communication routes
    { path: '/communication/admin-messages', element: <ProtectedRoute><Layout><AdminMessages /></Layout></ProtectedRoute> },
    { path: '/communication/support-tickets', element: <ProtectedRoute><Layout><SupportTickets /></Layout></ProtectedRoute> },
    { path: '/communication/notifications', element: <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute> },
    { path: '/communication/chat-customers', element: <ProtectedRoute><Layout><ChatCustomers /></Layout></ProtectedRoute> },
    { path: '/communication/email-responses', element: <ProtectedRoute><Layout><EmailResponses /></Layout></ProtectedRoute> },
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
