import { Button } from "@mui/material";
import image from "../../assets/helloAdmin.jpg";
import { FiPlus } from "react-icons/fi";
import DashBordBox from "../../Components/DashbordBoxes/DashBordBox.jsx";
import React, { useContext } from "react";
import { MyContext } from "../../App.jsx";
import OrderSummaryCards from "../../Components/Orders/OrderSummaryCards.jsx";
import { useSellerOrders } from "../../hooks/useSellerOrders.js";
import { formatINR, ORDER_RANGE_PATHS } from "../../utils/orderMetrics.js";
import { useNavigate } from "react-router-dom";

function DashBoard() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const navigate = useNavigate();
  const { orders, loading, error, stats } = useSellerOrders();
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <DashBordBox />

      <div className="bg-[#e7edfd] px-4 md:px-10 !py-12 flex flex-col md:flex-row items-center  md:gap-8 mt-2 justify-evenly rounded-md">
        <div className="info text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold leading-10 mb-3">
            Welcome To GiftnGifts
          </h1>
          <p className="text-sm md:text-base">
            Here's what’s happening on your store today. See the statistics at once.
          </p>
          <br />
          <Button
            className="btn-blue"
            onClick={() => setIsOpenAddProductPanel({ open: true, model: "Add Product" })}
          >
            <FiPlus className="pr-1 text-lg" />
            Add Product
          </Button>
        </div>
        <img src={image} alt="Admin Welcome" className="w-[150px] md:w-[250px]" />
      </div>

      <section className="mt-6 bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sales Dashboard</h2>
            <p className="text-sm text-gray-500">Quick view of today's performance</p>
          </div>
          <Button
            className="btn-blue !text-sm"
            onClick={() => navigate("/orders")}
          >
            View all orders
          </Button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading order metrics...</p>
          ) : (
            <OrderSummaryCards
              stats={stats}
              formatAmount={formatINR}
              onSelectRange={(range) => {
                const target = ORDER_RANGE_PATHS[range];
                if (target) navigate(target);
              }}
            />
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              last {recentOrders.length || 0} records
            </span>
          </div>
          {error ? (
            <p className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left">Customer</th>
                    <th className="py-2 px-3">Total</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b last:border-none">
                      <td className="py-2 px-3 text-left">
                        <p className="font-medium text-gray-900">
                          {order.shippingAddress?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">{order._id}</p>
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-green-700">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-sm text-gray-500">
                        {order.placedAt
                          ? new Date(order.placedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default DashBoard;