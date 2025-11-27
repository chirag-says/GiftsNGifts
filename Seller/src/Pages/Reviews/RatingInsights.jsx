import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdStar, MdTrendingUp, MdTrendingDown, MdInfo } from "react-icons/md";
import { FiCalendar, FiBarChart2, FiPieChart } from "react-icons/fi";

function RatingInsights() {
  const [insights, setInsights] = useState({
    currentRating: 0,
    ratingTrend: [],
    topRatedProducts: [],
    lowRatedProducts: [],
    commonPhrases: { positive: [], negative: [] },
    monthlyBreakdown: [],
    categoryRatings: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6months");
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    fetchInsights();
  }, [period]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/reviews/insights?period=${period}`, {
        headers: { stoken }
      });
      if (res.data.success) setInsights(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <MdStar key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"} />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const maxMonthlyReviews = Math.max(...(insights.monthlyBreakdown?.map(m => m.count) || [1]));

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rating Insights</h1>
          <p className="text-sm text-gray-500">Analyze your rating performance and trends</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-5 text-white col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Rating</p>
                  <h2 className="text-5xl font-bold mt-2">{insights.currentRating?.toFixed(1) || '0.0'}</h2>
                  <div className="flex mt-2">
                    {renderStars(insights.currentRating)}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${
                  insights.ratingChange >= 0 ? 'bg-white/20' : 'bg-red-500/30'
                }`}>
                  {insights.ratingChange >= 0 ? (
                    <MdTrendingUp className="text-4xl" />
                  ) : (
                    <MdTrendingDown className="text-4xl" />
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm opacity-90">
                {insights.ratingChange >= 0 ? '+' : ''}{insights.ratingChange?.toFixed(2) || '0'} from last period
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiBarChart2 />
                <span className="text-sm">Total Reviews</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{insights.totalReviews || 0}</h3>
              <p className="text-sm text-gray-500 mt-1">In selected period</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiPieChart />
                <span className="text-sm">5-Star Rate</span>
              </div>
              <h3 className="text-3xl font-bold text-green-600">{insights.fiveStarRate || 0}%</h3>
              <p className="text-sm text-gray-500 mt-1">Of all reviews</p>
            </div>
          </div>

          {/* Rating Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">📈 Rating Trend</h3>
            
            {insights.ratingTrend?.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No trend data available
              </div>
            ) : (
              <div className="h-48 flex items-end gap-2">
                {insights.ratingTrend?.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center">
                      <span className={`text-sm font-semibold ${getRatingColor(point.rating)}`}>
                        {point.rating?.toFixed(1)}
                      </span>
                      <div 
                        className="w-full bg-gradient-to-t from-yellow-400 to-orange-400 rounded-t-lg mt-1"
                        style={{ height: `${(point.rating / 5) * 150}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{point.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Reviews */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Monthly Review Volume</h3>
            
            <div className="h-40 flex items-end gap-2">
              {insights.monthlyBreakdown?.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">{month.count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                    style={{ height: `${(month.count / maxMonthlyReviews) * 120}px`, minHeight: '4px' }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top & Low Rated Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Rated */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-green-50">
                <h3 className="font-semibold text-green-800">🏆 Top Rated Products</h3>
              </div>
              {insights.topRatedProducts?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No data</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {insights.topRatedProducts?.map((product, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <MdStar />
                        <span className="font-semibold">{product.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Rated */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-red-50">
                <h3 className="font-semibold text-red-800">⚠️ Needs Improvement</h3>
              </div>
              {insights.lowRatedProducts?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No low-rated products</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {insights.lowRatedProducts?.map((product, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <MdStar />
                        <span className="font-semibold">{product.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Common Phrases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-semibold text-green-800 mb-3">👍 Positive Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {insights.commonPhrases?.positive?.map((phrase, i) => (
                  <span key={i} className="px-3 py-1 bg-white text-green-700 rounded-full text-sm border border-green-200">
                    {phrase.word} ({phrase.count})
                  </span>
                ))}
                {!insights.commonPhrases?.positive?.length && (
                  <span className="text-sm text-green-600">No data yet</span>
                )}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h4 className="font-semibold text-red-800 mb-3">👎 Negative Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {insights.commonPhrases?.negative?.map((phrase, i) => (
                  <span key={i} className="px-3 py-1 bg-white text-red-700 rounded-full text-sm border border-red-200">
                    {phrase.word} ({phrase.count})
                  </span>
                ))}
                {!insights.commonPhrases?.negative?.length && (
                  <span className="text-sm text-red-600">No data yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Category Ratings */}
          {insights.categoryRatings?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📁 Rating by Category</h3>
              <div className="space-y-3">
                {insights.categoryRatings.map((cat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-32 text-sm text-gray-700 truncate">{cat.category}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          cat.rating >= 4 ? 'bg-green-500' : cat.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(cat.rating / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`w-12 text-right font-semibold ${getRatingColor(cat.rating)}`}>
                      {cat.rating?.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RatingInsights;
