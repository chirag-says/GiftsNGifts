import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDiscount, MdEdit, MdSave, MdClose } from "react-icons/md";
import { FiPercent, FiPackage, FiSearch } from "react-icons/fi";

function DiscountManager() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [discountValue, setDiscountValue] = useState("");
  const stoken = localStorage.getItem("stoken");

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/marketing/discounts`, {
        headers: { stoken }
      });
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiscount = async (productId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/marketing/discounts/${productId}`,
        { discountPercentage: Number(discountValue) },
        { headers: { stoken } }
      );
      if (res.data.success) {
        setEditingProduct(null);
        setDiscountValue("");
        fetchData();
        alert("Discount updated!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update discount");
    }
  };

  const filteredProducts = data.products?.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discount Manager</h1>
          <p className="text-sm text-gray-500">Set discounts for individual products</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <MdDiscount className="text-xl" />
            <span className="text-sm font-medium">Products on Sale</span>
          </div>
          <h3 className="text-2xl font-bold">
            {data.products?.filter(p => p.discount > 0).length || 0}
          </h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{data.products?.length || 0}</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Avg. Discount</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {data.products?.length > 0 
              ? Math.round(data.products.reduce((sum, p) => sum + (p.discount || 0), 0) / data.products.length)
              : 0}%
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No Products Found</h3>
          <p className="text-gray-500 mt-2">Add products to start managing discounts</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Product</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Original Price</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Discount</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Final Price</th>
                  <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatINR(product.price)}</td>
                    <td className="px-5 py-4 text-right">
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                          product.discount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.discount || 0}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-green-600">
                        {formatINR(product.price * (1 - (product.discount || 0) / 100))}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {editingProduct === product._id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingProduct(null); setDiscountValue(""); }}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <MdClose />
                          </button>
                          <button
                            onClick={() => handleUpdateDiscount(product._id)}
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <MdSave />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingProduct(product._id); setDiscountValue(product.discount?.toString() || ""); }}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <MdEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
        <h4 className="font-semibold text-orange-800 mb-2">💡 Discount Tips</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Use discounts strategically - 10-20% works well for most products</li>
          <li>• Time-limited discounts create urgency</li>
          <li>• Bundle discounts can increase average order value</li>
          <li>• Don't over-discount - it can devalue your brand</li>
        </ul>
      </div>
    </div>
  );
}

export default DiscountManager;
