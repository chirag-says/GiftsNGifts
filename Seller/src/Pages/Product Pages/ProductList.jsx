// ✅ Cleaned & Complete ProductList.jsx with full Edit/Delete integration
import React, { useEffect, useState } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import { LuTrash2 } from "react-icons/lu";
import { Button, TextField, IconButton } from "@mui/material";
import { MdOutlineEdit, MdClose, MdSaveAlt } from "react-icons/md";
import SearchBox from "../../Components/SearchBox/SearchBox";
import Progress from "../../Components/Progress/Progress";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updatetask, setUpdatetask] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const stoken = localStorage.getItem("stoken") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
   useEffect(() => {
  if (!searchTerm) {
    setFilteredProducts(products);
  } else {
    const lower = searchTerm.toLowerCase();
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(lower) ||
      getCategoryNameById(product.categoryname).toLowerCase().includes(lower) ||
      getSubCategoryNameById(product.subcategory).toLowerCase().includes(lower) ||
      (product.sellerId?.name?.toLowerCase().includes(lower) || false)
    );
    setFilteredProducts(filtered);
  }
}, [searchTerm, products]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/getproducts`, { headers: { stoken } });
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getcategories`);
    setCategories(res.data);
  };

  const fetchSubcategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getsubcategories`);
    setSubcategories(res.data);
  };

  const getCategoryNameById = (id) => categories.find(c => c._id === id)?.categoryname || "-";
  const getSubCategoryNameById = (id) => subcategories.find(s => s._id === id)?.subcategory || "-";

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setUpdatetask({
      [product._id]: { title: product.title, price: product.price, oldprice: product.oldprice },
    });
  };

  const handleupdate = (id, value, field) => {
    setUpdatetask((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleImageChange = (e) => setNewImageFile(e.target.files[0]);

  const update = async (id) => {
    const updateData = updatetask[id] || {};
    try {
      if (newImageFile) {
        const formData = new FormData();
        formData.append("image", newImageFile);
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/product/updateimage/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/product/updateproduct/${id}`, updateData);
      fetchProducts();
      setEditingId(null);
      setUpdatetask({});
      setNewImageFile(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const removeproduct = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/deleteproduct/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
   <div className="products bg-white shadow-lg border border-gray-200 rounded py-6 px-6">

  {/* HEADER + SEARCH */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
    <h2 className="text-2xl font-semibold text-slate-800">Product List</h2>

    <div className="w-full md:max-w-sm">
      <SearchBox
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search Products..."
      />
    </div>
  </div>

  {/* TABLE */}
  <div className="rounded-xl border border-gray-200 overflow-hidden">
    <table className="min-w-full text-sm">

      {/* TABLE HEAD */}
      <thead className="bg-gray-50 border-b">
        <tr className="text-gray-700">
          <th className="px-6 py-3 text-left font-semibold">Product</th>
          <th className="px-6 py-3 text-left font-semibold">Category</th>
          <th className="px-6 py-3 text-left font-semibold">Subcategory</th>
          <th className="px-6 py-3 text-left font-semibold">Price</th>
          <th className="px-6 py-3 text-center font-semibold">Actions</th>
        </tr>
      </thead>

      {/* TABLE BODY */}
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="5" className="py-10 text-center">
              <Progress />
            </td>
          </tr>
        ) : filteredProducts.length === 0 ? (
          <tr>
            <td colSpan="5" className="py-10 text-center text-gray-500">
              No products found.
            </td>
          </tr>
        ) : (
          filteredProducts.map((product) => {
            const isEditing = editingId === product._id;
            const updateData = updatetask[product._id] || {};

            return (
              <tr
                key={product._id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                {/* PRODUCT + IMAGE */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">

                    {/* IMAGE BOX */}
                    <div className="relative w-14 h-14 rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                      <img
                        src={product.images[0]?.url}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />

                      {isEditing && (
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      )}
                    </div>

                    {/* TITLE */}
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={updateData.title}
                        onChange={(e) =>
                          handleupdate(product._id, e.target.value, "title")
                        }
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{product.title}</p>
                    )}
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-6 py-4 text-gray-700">
                  {getCategoryNameById(product.categoryname)}
                </td>

                {/* SUBCATEGORY */}
                <td className="px-6 py-4 text-gray-700">
                  {getSubCategoryNameById(product.subcategory)}
                </td>

                {/* PRICE */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">₹{product.price}</span>
                  <span className="text-xs text-gray-400 ml-2 line-through">
                    ₹{product.oldprice}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="px-6 py-4 text-center">
                  {isEditing ? (
                    <div className="flex justify-center gap-2">
                      <IconButton className="hover:bg-green-100" onClick={() => update(product._id)}>
                        <MdSaveAlt size={20} className="text-green-600" />
                      </IconButton>

                      <IconButton className="hover:bg-red-100" onClick={() => setEditingId(null)}>
                        <MdClose size={20} className="text-red-600" />
                      </IconButton>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <IconButton className="hover:bg-blue-100" onClick={() => handleEditClick(product)}>
                        <MdOutlineEdit size={20} className="text-blue-600" />
                      </IconButton>

                      <IconButton className="hover:bg-red-100" onClick={() => removeproduct(product._id)}>
                        <LuTrash2 size={20} className="text-red-600" />
                      </IconButton>
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