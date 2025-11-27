import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdStar, MdStarBorder, MdStarHalf, MdFilterList, MdSearch } from "react-icons/md";
import { FiThumbsUp, FiMessageCircle, FiImage } from "react-icons/fi";

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/reviews?rating=${filter}`, {
        headers: { stoken }
      });
      if (res.data.success) {
        setReviews(res.data.data.reviews || []);
        setStats(res.data.data.stats || stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<MdStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<MdStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<MdStarBorder key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const totalRatings = Object.values(stats.ratingBreakdown).reduce((a, b) => a + b, 0);

  const filteredReviews = reviews.filter(r => 
    r.productName?.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
        <p className="text-sm text-gray-500">View and manage all customer reviews</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rating Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <h2 className="text-5xl font-bold text-gray-800">{stats.averageRating?.toFixed(1) || '0.0'}</h2>
                <div className="flex justify-center gap-1 my-2">
                  {renderStars(stats.averageRating)}
                </div>
                <p className="text-gray-500">{stats.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 col-span-2">
              <h3 className="font-semibold text-gray-800 mb-4">Rating Breakdown</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.ratingBreakdown[star] || 0;
                  const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-gray-600">{star}★</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "5", "4", "3", "2", "1"].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilter(rating)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === rating 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {rating === "all" ? "All" : `${rating}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <MdStar className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No Reviews Yet</h3>
              <p className="text-gray-500 mt-2">Customer reviews will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {review.productImage ? (
                        <img src={review.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiImage />
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{review.productName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              by {review.customerName}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {review.title && (
                        <h5 className="font-medium text-gray-800 mt-2">{review.title}</h5>
                      )}
                      
                      <p className="text-gray-600 mt-2">{review.comment}</p>

                      {/* Review Images */}
                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, j) => (
                            <img 
                              key={j} 
                              src={img} 
                              alt="" 
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                        <button className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                          <FiThumbsUp /> Helpful ({review.helpfulCount || 0})
                        </button>
                        <a 
                          href={`/seller/reviews/respond/${review._id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FiMessageCircle /> {review.response ? 'View Response' : 'Respond'}
                        </a>
                      </div>

                      {/* Seller Response */}
                      {review.response && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800">Your Response:</p>
                          <p className="text-sm text-blue-700 mt-1">{review.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyReviews;
