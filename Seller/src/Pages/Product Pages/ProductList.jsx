import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, TextField, IconButton, Chip } from "@mui/material";
import { MdOutlineEdit, MdClose, MdSaveAlt } from "react-icons/md";
import { LuTrash2 } from "react-icons/lu";
import SearchBox from "../../Components/SearchBox/SearchBox"; // Ensure path is correct
import Progress from "../../Components/Progress/Progress"; // Ensure path is correct

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updateTask, setUpdateTask] = useState({});
  const stoken = localStorage.getItem("stoken") || "";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/getproducts`,
        { headers: { stoken } }
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start Edit Mode
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setUpdateTask({
      [product._id]: {
        title: product.title,
        price: product.price,
        stock: product.stock, // ⭐ Capture current stock
      },
    });
  };

  // Handle Input Change
  const handleUpdateChange = (id, value, field) => {
    setUpdateTask((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Save Updates
  const saveUpdate = async (id) => {
    const dataToSend = updateTask[id];
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/updateproduct/${id}`,
        dataToSend
      );
      await fetchProducts(); // Refresh list to see calculated Status
      setEditingId(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const deleteProduct = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/deleteproduct/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <div className="w-1/3"><SearchBox placeholder="Search..." /></div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 font-semibold uppercase">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3 text-center">Stock Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="py-10 text-center"><Progress /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="4" className="py-10 text-center text-gray-500">No products found.</td></tr>
            ) : (
              products.map((product) => {
                const isEditing = editingId === product._id;
                const draft = updateTask[product._id] || {};

                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    
                    {/* 1. Product Name & Img */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={product.images[0]?.url} alt="" className="w-12 h-12 rounded object-cover border" />
                      {isEditing ? (
                        <TextField 
                          size="small" 
                          value={draft.title} 
                          onChange={(e) => handleUpdateChange(product._id, e.target.value, "title")} 
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{product.title}</span>
                      )}
                    </td>

                    {/* 2. Price */}
                    <td className="px-6 py-4 font-semibold text-gray-700">
                       {isEditing ? (
                        <TextField 
                          type="number" size="small" className="w-24"
                          value={draft.price} 
                          onChange={(e) => handleUpdateChange(product._id, e.target.value, "price")} 
                        />
                      ) : (
                        `₹${product.price}`
                      )}
                    </td>

                    {/* 3. STOCK STATUS (Dynamic) */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                         <TextField 
                           type="number" size="small" label="Qty" className="w-24"
                           value={draft.stock ?? product.stock} 
                           onChange={(e) => handleUpdateChange(product._id, e.target.value, "stock")} 
                         />
                      ) : (
                        <div>
                          {product.stock <= 0 ? (
                            <Chip label="Out of Stock" color="error" size="small" className="font-bold" />
                          ) : product.stock < 5 ? (
                            <Chip label={`Low: ${product.stock} Left`} color="warning" size="small" className="font-bold" />
                          ) : (
                            <Chip label={`${product.stock} In Stock`} color="success" size="small" variant="outlined" className="font-bold bg-green-50" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* 4. Actions */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <IconButton onClick={() => saveUpdate(product._id)} className="bg-green-50 text-green-600 hover:bg-green-100"><MdSaveAlt /></IconButton>
                          <IconButton onClick={() => setEditingId(null)} className="bg-red-50 text-red-600 hover:bg-red-100"><MdClose /></IconButton>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <IconButton onClick={() => handleEditClick(product)} className="text-blue-600 hover:bg-blue-50"><MdOutlineEdit /></IconButton>
                          <IconButton onClick={() => deleteProduct(product._id)} className="text-red-600 hover:bg-red-50"><LuTrash2 /></IconButton>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;