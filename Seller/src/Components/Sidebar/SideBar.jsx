import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaAngleDown } from "react-icons/fa";
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
import { CiLogout } from "react-icons/ci";
import { MdOutlinePayments, MdOutlineMessage, MdOutlineInsights } from "react-icons/md";
import { PiStorefrontLight } from "react-icons/pi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { Button } from "@mui/material";
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
    title: "Gifts",
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
      { label: "Earnings", highlight: true },
      { label: "Pending Payments" },
      { label: "Transaction History" },
      { label: "Payout Requests" },
      { label: "Commission Details" },
      { label: "Bank Details" },
      { label: "Invoices" },
    ],
  },
  {
    title: "Customers",
    icon: LuUsers,
    items: [
      { label: "My Customers", highlight: true },
      { label: "Order History" },
      { label: "Customer Reviews" },
      { label: "Wishlist Insights" },
      { label: "Customer Messages" },
      { label: "Loyalty Program" },
    ],
  },
  {
    title: "Sellers",
    icon: PiStorefrontLight,
    items: [
      { label: "My Store Profile", path: "/seller-profile", highlight: true },
      { label: "Store Settings" },
      { label: "Business Info" },
      { label: "Store Customization" },
      { label: "Holiday Mode" },
      { label: "Store Performance" },
      { label: "Verification Status" },
    ],
  },
  // Reports section
  {
    title: "Reports & Analytics",
    icon: MdOutlineInsights,
    items: [
      { label: "Product Performance", path: "/reports/product-performance", highlight: true },
      { label: "Revenue Analytics" },
      { label: "Traffic Insights" },
      { label: "Conversion Reports" },
      { label: "Export Data" },
      { label: "Inventory Reports" },
    ],
  },
  {
    title: "Categories",
    icon: TbCategoryPlus,
    items: [
      { label: "Browse Categories", path: "/categorylist", highlight: true },
      { label: "My Categories" },
      { label: "Category Performance" },
      { label: "Category Suggestions" },
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
      { label: "My Promotions", highlight: true },
      { label: "Create Coupon" },
      { label: "Discount Manager" },
      { label: "Featured Products" },
      { label: "Seasonal Offers" },
      { label: "Marketing Budget" },
      { label: "Promotional Tools" },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: LuTruck,
    items: [
      { label: "Shipping Settings", highlight: true },
      { label: "Delivery Partners" },
      { label: "Shipping Rates" },
      { label: "Package Dimensions" },
      { label: "Tracking Orders" },
      { label: "Pickup Schedule" },
      { label: "Return Address" },
    ],
  },
  {
    title: "Reviews & Ratings",
    icon: LuStar,
    items: [
      { label: "My Reviews", highlight: true },
      { label: "Product Reviews" },
      { label: "Store Reviews" },
      { label: "Respond to Reviews" },
      { label: "Review Requests" },
      { label: "Rating Insights" },
    ],
  },
  {
    title: "Personalization",
    icon: LuGift,
    items: [
      { label: "Offer Personalization", highlight: true },
      { label: "Customization Options" },
      { label: "Gift Wrapping" },
      { label: "Greeting Cards" },
      { label: "Custom Messages" },
      { label: "Add-on Services" },
      { label: "Pricing for Custom" },
    ],
  },
];

function SideBar() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed z-[1050] top-6 !left-5 sm:text-xl text-[15px] px-4 py-2 bg-white text-black rounded shadow-lg border border-gray-200 hover:bg-gray-100"
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[1040]"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 w-[70vw] max-w-[400px] max-h-screen bg-white z-[1051]
          border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <ul className="pt-2 font-semibold">
          <li>
            <Button
              onClick={toggleSidebar}
              className="float-end !py-4 font-semibold justify-end px-6 flex gap-3 text-[16px] !text-[rgba(0,0,0,0.8)] hover:bg-[#f1f1f1]"
            >
              <FaTimes />
            </Button>
          </li>

          {menuSections.map((section, index) => (
            <li key={section.title} className="px-2">
              <button
                onClick={() => isOpenSubmenu(index)}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] text-gray-800 hover:bg-[#f7f7f7]"
              >
                <section.icon className="text-[20px] text-gray-900" />
                <div className="text-left">
                  <p className="font-semibold text-[15px] leading-tight">{section.title}</p>
                  {section.items[0]?.label && (
                    <span className="text-xs text-gray-500">
                      {section.items[0].label}
                    </span>
                  )}
                </div>
                <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                  <FaAngleDown
                    className={`transition-all ${submenuIndex === index ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              <ReactCollapse isOpened={submenuIndex === index} className="pl-8">
                <div className="border-l border-gray-100 pl-4 pr-3 pb-4">
                  {section.items.map((item) => {
                    const isInteractive = item.path || item.action;
                    const ItemTag = isInteractive ? "button" : "div";

                    return (
                      <ItemTag
                        key={`${section.title}-${item.label}`}
                        onClick={() => isInteractive && handleItemAction(item)}
                        className={`flex w-full items-center gap-3 py-1 text-sm ${
                          isInteractive
                            ? "text-gray-800 hover:text-black"
                            : "text-gray-400 cursor-default"
                        } ${item.highlight ? "font-semibold" : "font-normal"}`}
                      >
                        <span className="block w-[4px] h-[4px] rounded-full bg-gray-300"></span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.highlight && (
                          <span className="text-[10px] uppercase tracking-wide text-gray-400">
                            primary
                          </span>
                        )}
                      </ItemTag>
                    );
                  })}
                </div>
              </ReactCollapse>
            </li>
          ))}
          <li>
            <Button className="w-full !py-3 !font-semibold !justify-start !px-6 flex gap-3 text-[16px] !text-[rgba(0,0,0,0.8)] hover:!bg-[#f1f1f1]">
              <CiLogout className="text-[18px]" />
              <span
                style={{ textTransform: "initial" }}
                onClick={() => {
                  handleLogout();
                  closeSidebar();
                }}
              >
                Logout
              </span>
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default SideBar;
