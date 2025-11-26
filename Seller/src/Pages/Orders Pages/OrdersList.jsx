import React, { useMemo, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useSellerOrders } from "../../hooks/useSellerOrders.js";
import OrderSummaryCards from "../../Components/Orders/OrderSummaryCards.jsx";
import {
  filterOrdersByRange,
  filterOrdersByStatus,
  formatINR,
  ORDER_RANGE_TITLES,
  ORDER_RANGE_PATHS,
  ORDER_STATUS_META,
} from "../../utils/orderMetrics.js";
import { useNavigate } from "react-router-dom";

function OrdersList({ focusedRange, statusKey }) {
  const [openRow, setOpenRow] = useState(null);
  const navigate = useNavigate();
  const { orders, setOrders, loading, error, stats } = useSellerOrders();
  const stoken = localStorage.getItem("stoken");

  const toggleDetails = (i) => {
    setOpenRow(openRow === i ? null : i);
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/orders/${id}`,
        { status },
        { headers: { stoken } }
      );

      if (data.success) {
        toast.success("Order status updated!");
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status } : o))
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = useMemo(() => {
    const byRange = filterOrdersByRange(orders, focusedRange);
    return filterOrdersByStatus(byRange, statusKey);
  }, [orders, focusedRange, statusKey]);

  const meta = statusKey ? ORDER_STATUS_META[statusKey] : null;

  const title = meta?.title || ORDER_RANGE_TITLES[focusedRange] || "Orders Overview";
  const subtitle =
    meta?.subtitle ||
    (focusedRange ? "Detailed breakdown for the selected time period" : "Your complete order analytics");

  const handleRangeClick = (range) => {
    const path = ORDER_RANGE_PATHS[range];
    if (path) navigate(path);
  };

  return (
    <div className="space-y-8 bg-white p-6 animate-fadeIn">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* SUMMARY CARDS */}
      <OrderSummaryCards
        stats={stats}
        formatAmount={formatINR}
        focusedRange={focusedRange}
        onSelectRange={handleRangeClick}
      />

      {/* MAIN TABLE BLOCK */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl text-center text-gray-500 shadow-sm">
          Loading orders…
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 shadow-sm">{error}</div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm text-gray-500">
              {meta?.emptyMessage || "No orders found in this category."}
            </div>
          ) : (
            <table className="min-w-[1100px] w-full border-separate border-spacing-0">

              {/* TABLE HEAD */}
              <thead>
                <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 sticky top-0 shadow-sm z-10">
                  <th className="py-3 px-4"></th>
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-left">Address</th>
                  <th className="py-3 px-4">Pincode</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {filteredOrders.map((order, i) => (
                  <React.Fragment key={order._id}>

                    {/* MAIN ROW */}
                    <tr
                      className="bg-white border-b-1 border-gray-400 hover:bg-gray-50 transition border-b group"
                    >
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleDetails(i)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          {openRow === i ? (
                            <FaAngleUp className="text-gray-600" />
                          ) : (
                            <FaAngleDown className="text-gray-600" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-800">{order._id}</td>

                      <td className="px-4 py-4 text-gray-700">{order.shippingAddress?.name}</td>

                      <td className="px-4 py-4 text-gray-600">{order.shippingAddress?.phone}</td>

                      <td className="px-4 py-4 max-w-[260px] truncate text-gray-600">
                        {order.shippingAddress?.address}
                      </td>

                      <td className="px-4 py-4">{order.shippingAddress?.pin}</td>

                      <td className="px-4 py-4 font-semibold text-green-700">
                        {formatINR(order.totalAmount)}
                      </td>

                      <td className="px-4 py-4">{order.user?.name || "-"}</td>

                      <td className="px-4 py-4">{order.paymentId || "-"}</td>

                      <td className="px-4 py-4">
                        <select
                          className="rounded-lg border border-gray-300 px-2 py-1 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-200"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                    </tr>

                    {/* EXPANDED PRODUCT ROW */}
                    {openRow === i && (
                      <tr>
                        <td colSpan="12" className="bg-gray-50 px-6 py-6">
                          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                  <th className="px-4 py-3 text-left">Product ID</th>
                                  <th className="px-4 py-3">Image</th>
                                  <th className="px-4 py-3 text-left">Product</th>
                                  <th className="px-4 py-3">Price</th>
                                  <th className="px-4 py-3">Qty</th>
                                  <th className="px-4 py-3">Subtotal</th>
                                </tr>
                              </thead>

                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={item._id} className="border-t border-b-1 border-gray-400">
                                    <td className="px-4 py-3 text-left text-gray-700">
                                      {item.productId?._id || item.productId}
                                    </td>

                                    <td className="px-4 py-3">
                                      {item.productId?.images?.[0]?.url ? (
                                        <img
                                          src={item.productId.images[0].url}
                                          className="w-12 h-12 rounded-md object-cover mx-auto shadow-sm"
                                        />
                                      ) : (
                                        "-"
                                      )}
                                    </td>

                                    <td className="px-4 py-3 text-left text-gray-700">
                                      {item.productId?.title || "-"}
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">
                                      {formatINR(item.price)}
                                    </td>

                                    <td className="px-4 py-3">{item.quantity}</td>

                                    <td className="px-4 py-3 font-medium text-gray-900">
                                      {formatINR(item.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))}
              </tbody>

            </table>
          )}
        </div>
      )}

    </div>
  );
}

export default OrdersList;
