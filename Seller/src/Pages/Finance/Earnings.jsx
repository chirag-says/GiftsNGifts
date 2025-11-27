import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatINR } from "../../utils/orderMetrics";
import { MdAttachMoney, MdHistory } from "react-icons/md";

function Earnings() {
  const [data, setData] = useState({ totalEarnings: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/finance/earnings`, {
          headers: { stoken }
        });
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Earnings & Payouts</h1>
        <p className="text-sm text-gray-500">Track your revenue and transaction history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <MdAttachMoney className="text-2xl" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Earnings</span>
          </div>
          <h2 className="text-3xl font-bold">{formatINR(data.totalEarnings)}</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-semibold">Pending Clearance</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">{formatINR(0)}</h2>
          <p className="text-xs text-gray-400 mt-1">Available for payout soon</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-semibold">Next Payout</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">Processing</h2>
          <p className="text-xs text-green-600 mt-1">Expected: 2 Days</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center gap-2">
          <MdHistory className="text-gray-500 text-xl" />
          <h3 className="font-semibold text-gray-800">Transaction History</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading transactions...</div>
        ) : data.transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No completed transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">{new Date(txn.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-xs">{txn.orderId}</td>
                    <td className="px-6 py-4">{txn.customer}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-700">+{formatINR(txn.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Earnings;