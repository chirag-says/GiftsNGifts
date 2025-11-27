import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import {
  LuUsers,
  LuMegaphone,
  LuTruck,
  LuStar,
  LuGift,
} from "react-icons/lu";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategoryPlus } from "react-icons/tb";
import { MdOutlinePayments, MdOutlineMessage, MdOutlineInsights } from "react-icons/md";
import { PiStorefrontLight } from "react-icons/pi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { Collapse as ReactCollapse } from "react-collapse";
import { MyContext } from "../../App.jsx";

const menuSections = [
  {
    title: "Dashboard",
    icon: RxDashboard,
    items: [
      { label: "Sales Dashboard", path: "/", highlight: true },
      { label: "Today's Orders", path: "/orders/today" },
      { label: "This Month's Orders", path: "/orders/month" },
      { label: "This Year's Orders", path: "/orders/year" },
      { label: "Overall Orders", path: "/orders/overall" },
    ],
  },
  {
    title: "Products",
    icon: RiProductHuntLine,
    items: [
      { label: "My Products", path: "/products", highlight: true },
      { label: "Add New Product", action: { type: "modal", model: "Add Product" } },
      { label: "Active Products", path: "/products/active" },
      { label: "Draft Products", path: "/products/drafts" },
      { label: "Out of Stock", path: "/products/out-of-stock" },
      { label: "Product Reviews", path: "/products/reviews" },
    ],
  },
  {
    title: "Orders",
    icon: HiOutlineClipboardList,
    items: [
      { label: "My Orders", path: "/orders", highlight: true },
      { label: "New Orders", path: "/orders/new" },
      { label: "Processing", path: "/orders/processing" },
      { label: "Ready to Ship", path: "/orders/ready-to-ship" },
      { label: "Shipped", path: "/orders/shipped" },
      { label: "Completed", path: "/orders/completed" },
      { label: "Returns/Cancellations", path: "/orders/returns" },
      { label: "Print Labels", path: "/orders/labels" },
    ],
  },
  // Communication section
  {
    title: "Communication",
    icon: MdOutlineMessage,
    items: [
      { label: "Admin Messages", path: "/communication/admin-messages", highlight: true },
      { label: "Support Tickets", path: "/communication/support-tickets" },
      { label: "Notifications", path: "/communication/notifications" },
      { label: "Chat with Customers", path: "/communication/chat-customers" },
      { label: "Email Responses", path: "/communication/email-responses" },
    ],
  },
  {
    title: "Payments & Finance",
    icon: MdOutlinePayments,
    items: [
      { label: "Earnings", path: "/payments/earnings", highlight: true },
      { label: "Pending Payments", path: "/payments/pending" },
      { label: "Transaction History", path: "/payments/transactions" },
      { label: "Payout Requests", path: "/payments/payouts" },
      { label: "Commission Details", path: "/payments/commission" },
      { label: "Bank Details", path: "/payments/bank-details" },
      { label: "Invoices", path: "/payments/invoices" },
      { label: "Refunds", path: "/payments/refunds" },
      { label: "Payment Summary", path: "/payments/summary" },
      { label: "Settlements", path: "/payments/settlements" },
    ],
  },
  {
    title: "Customers",
    icon: LuUsers,
    items: [
      { label: "My Customers", path: "/customers", highlight: true },
      { label: "Order History", path: "/customers/orders" },
      { label: "Customer Reviews", path: "/customers/reviews" },
      { label: "Wishlist Insights", path: "/customers/wishlist" },
      { label: "Customer Messages", path: "/customers/messages" },
      { label: "Loyalty Program", path: "/customers/loyalty" },
    ],
  },
  {
    title: "Sellers",
    icon: PiStorefrontLight,
    items: [
      { label: "My Store Profile", path: "/seller-profile", highlight: true },
      { label: "Store Settings", path: "/store/settings" },
      { label: "Business Info", path: "/store/business-info" },
      { label: "Store Customization", path: "/store/customization" },
      { label: "Holiday Mode", path: "/store/holiday-mode" },
      { label: "Store Performance", path: "/store/performance" },
      { label: "Verification Status", path: "/store/verification" },
    ],
  },
  // Reports section
  {
    title: "Reports & Analytics",
    icon: MdOutlineInsights,
    items: [
      { label: "Product Performance", path: "/reports/product-performance", highlight: true },
      { label: "Revenue Analytics", path: "/analytics/revenue" },
      { label: "Traffic Insights", path: "/analytics/traffic" },
      { label: "Conversion Reports", path: "/analytics/conversion" },
      { label: "Export Data", path: "/analytics/export" },
      { label: "Inventory Reports", path: "/analytics/inventory" },
    ],
  },
  {
    title: "Categories",
    icon: TbCategoryPlus,
    items: [
      { label: "Browse Categories", path: "/categorylist", highlight: true },
      { label: "My Categories", path: "/categories/my" },
      { label: "Category Performance", path: "/categories/performance" },
      { label: "Category Suggestions", path: "/categories/suggestions" },
      {
        label: "Request New Category",
        action: { type: "modal", model: "Add New Category" },
      },
    ],
  },
  {
    title: "Marketing & Promotions",
    icon: LuMegaphone,
    items: [
      { label: "My Promotions", path: "/marketing/promotions", highlight: true },
      { label: "Create Coupon", action: { type: "modal", model: "Create Coupon" } },
      { label: "Discount Manager", path: "/marketing/discounts" },
      { label: "Featured Products", path: "/marketing/featured" },
      { label: "Seasonal Offers", path: "/marketing/seasonal" },
      { label: "Marketing Budget", path: "/marketing/budget" },
      { label: "Promotional Tools", path: "/marketing/tools" },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: LuTruck,
    items: [
      { label: "Shipping Settings", path: "/shipping/settings", highlight: true },
      { label: "Delivery Partners", path: "/shipping/partners" },
      { label: "Shipping Rates", path: "/shipping/rates" },
      { label: "Package Dimensions", path: "/shipping/dimensions" },
      { label: "Tracking Orders", path: "/shipping/tracking" },
      { label: "Pickup Schedule", path: "/shipping/pickup" },
      { label: "Return Address", path: "/shipping/return-address" },
    ],
  },
  {
    title: "Reviews & Ratings",
    icon: LuStar,
    items: [
      { label: "My Reviews", path: "/reviews", highlight: true },
      { label: "Product Reviews", path: "/reviews/products" },
      { label: "Store Reviews", path: "/reviews/store" },
      { label: "Respond to Reviews", path: "/reviews/respond" },
      { label: "Review Requests", path: "/reviews/requests" },
      { label: "Rating Insights", path: "/reviews/insights" },
    ],
  },
  {
    title: "Personalization",
    icon: LuGift,
    items: [
      { label: "Personalization Options", path: "/personalization/options", highlight: true },
      { label: "Gift Wrapping", path: "/personalization/gift-wrapping" },
      { label: "Greeting Cards", path: "/personalization/greeting-cards" },
      { label: "Custom Messages", path: "/personalization/messages" },
      { label: "Add-on Services", path: "/personalization/addons" },
      { label: "Bulk Personalization", path: "/personalization/bulk" },
      { label: "Custom Pricing", path: "/personalization/pricing" },
    ],
  },
];

function SideBar() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isOpenSubmenu = (index) => {
    setSubmenuIndex((prev) => (prev === index ? null : index));
  };

  const handleLogout = () => {
    localStorage.removeItem("stoken");
    navigate("/login");
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleItemAction = (item) => {
    if (item?.action?.type === "modal") {
      setIsOpenAddProductPanel({ open: true, model: item.action.model });
      closeSidebar();
      return;
    }
    if (item?.path) {
      navigate(item.path);
      closeSidebar();
    }
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      {/* Premium Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed z-[1050] top-5 left-4 p-2.5 bg-white text-gray-700 rounded-xl 
                   shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md
                   transition-all duration-200 ease-out group"
        aria-label="Open menu"
      >
        <HiOutlineMenuAlt2 className="text-xl group-hover:text-indigo-600 transition-colors" />
      </button>

      {/* Premium Overlay with blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[1040] transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Premium Sidebar */}
      <div
        className={`
          fixed top-0 left-0 w-[320px] h-screen bg-white z-[1051]
          shadow-2xl shadow-gray-900/10
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LuGift className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">GiftNGifts</h2>
              <p className="text-xs text-gray-500">Seller Portal</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {menuSections.map((section, index) => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => isOpenSubmenu(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 ease-out group
                  ${submenuIndex === index 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${submenuIndex === index 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'}
                `}>
                  <section.icon className="text-lg" />
                </div>
                <span className="flex-1 font-medium text-[15px]">{section.title}</span>
                <FiChevronDown 
                  className={`text-gray-400 transition-transform duration-200 ${
                    submenuIndex === index ? "rotate-180 text-indigo-500" : ""
                  }`} 
                />
              </button>

              <ReactCollapse isOpened={submenuIndex === index}>
                <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                  {section.items.map((item) => {
                    const isInteractive = item.path || item.action;
                    const isActive = item.path && isActivePath(item.path);
                    const ItemTag = isInteractive ? "button" : "div";

                    return (
                      <ItemTag
                        key={`${section.title}-${item.label}`}
                        onClick={() => isInteractive && handleItemAction(item)}
                        className={`
                          flex w-full items-center gap-3 py-2.5 px-3 rounded-lg text-sm
                          transition-all duration-150
                          ${isActive 
                            ? 'bg-indigo-50 text-indigo-700 font-medium' 
                            : isInteractive
                              ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              : 'text-gray-400 cursor-default'}
                        `}
                      >
                        <span className={`
                          w-1.5 h-1.5 rounded-full transition-colors
                          ${isActive ? 'bg-indigo-500' : 'bg-gray-300'}
                        `} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.highlight && !isActive && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            main
                          </span>
                        )}
                      </ItemTag>
                    );
                  })}
                </div>
              </ReactCollapse>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 
                       hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <div className="p-2 bg-gray-100 group-hover:bg-red-100 rounded-lg transition-colors">
              <FiLogOut className="text-lg text-gray-500 group-hover:text-red-500" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideBar;
