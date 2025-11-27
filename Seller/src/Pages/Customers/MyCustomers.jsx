import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatINR } from "../../utils/orderMetrics";
import { LuSearch } from "react-icons/lu";
import Avatar from '@mui/material/Avatar';

function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/customers/my-customers`, {
          headers: { stoken }
        });
        if (res.data.success) setCustomers(res.data.customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Customers</h1>
          <p className="text-sm text-gray-500">People who have purchased from your store.</p>
        </div>
        <div className="relative w-full md:w-64">
          <LuSearch className="absolute top-3 left-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-center">Total Spent</th>
                  <th className="px-6 py-4 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar sx={{ bgcolor: '#7d0492', width: 32, height: 32, fontSize: 14 }}>
                          {cust.name[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-800">{cust.name}</p>
                          <p className="text-xs text-gray-500">ID: {cust._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <p>{cust.email}</p>
                      <p className="text-xs">{cust.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{cust.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-800">
                      {formatINR(cust.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
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

export default MyCustomers;