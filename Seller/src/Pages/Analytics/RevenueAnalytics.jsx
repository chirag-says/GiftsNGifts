import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdTrendingUp, MdCalendarToday, MdDownload } from "react-icons/md";
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

function RevenueAnalytics() {
  const [data, setData] = useState({
    totalRevenue: 0,
    previousPeriodRevenue: 0,
    growthRate: 0,
    monthlyData: [],
    topCategories: [],
    revenueByPaymentMethod: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6months");
  const stoken = localStorage.getItem("stoken");

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/analytics/revenue?period=${period}`, {
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
  }, [period]);

  const maxRevenue = Math.max(...(data.monthlyData?.map(d => d.revenue) || [1]));

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revenue Analytics</h1>
          <p className="text-sm text-gray-500">Track your earnings and revenue trends</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <MdDownload /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <FiDollarSign className="text-xl" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <h3 className="text-3xl font-bold">{formatINR(data.totalRevenue)}</h3>
              <div className="flex items-center gap-1 mt-3 text-sm">
                {data.growthRate >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{Math.abs(data.growthRate)}% {data.growthRate >= 0 ? 'increase' : 'decrease'}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-500 mb-1">Previous Period</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatINR(data.previousPeriodRevenue)}</h3>
              <p className="text-sm text-gray-500 mt-2">For comparison</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-500 mb-1">Average Monthly</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatINR(data.totalRevenue / (data.monthlyData?.length || 1))}
              </h3>
              <p className="text-sm text-gray-500 mt-2">Per month average</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Monthly Revenue Trend</h3>
            
            {data.monthlyData?.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            ) : (
              <div className="h-64 flex items-end gap-2">
                {data.monthlyData?.map((month, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs text-gray-600 mb-1">{formatINR(month.revenue)}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all hover:from-green-600 hover:to-emerald-500"
                        style={{ height: `${(month.revenue / maxRevenue) * 200}px`, minHeight: '20px' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{month.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category & Payment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Revenue by Category</h3>
              
              {data.topCategories?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              ) : (
                <div className="space-y-4">
                  {data.topCategories?.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.category}</span>
                        <span className="text-gray-600">{formatINR(cat.revenue)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-green-500' :
                            i === 1 ? 'bg-blue-500' :
                            i === 2 ? 'bg-purple-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${(cat.revenue / data.totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
              
              {data.revenueByPaymentMethod?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payment data available</p>
              ) : (
                <div className="space-y-4">
                  {data.revenueByPaymentMethod?.map((method, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          method.method === 'UPI' ? 'bg-purple-500' :
                          method.method === 'Card' ? 'bg-blue-500' :
                          method.method === 'COD' ? 'bg-orange-500' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="font-medium text-gray-700">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{formatINR(method.revenue)}</p>
                        <p className="text-xs text-gray-500">{method.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h4 className="font-semibold text-green-800 mb-2">💰 Revenue Insights</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your best performing month was {data.monthlyData?.[0]?.month || 'N/A'}</li>
              <li>• {data.topCategories?.[0]?.category || 'Your products'} generates the most revenue</li>
              <li>• Consider running promotions during slower months to boost sales</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default RevenueAnalytics;
