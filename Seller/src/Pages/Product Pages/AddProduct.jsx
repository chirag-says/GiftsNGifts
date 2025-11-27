import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Button, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { MdOutlineCloudUpload, MdClose } from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCategory from '../Category/AddCategory';
import AddSubCategory from '../Category/AddSubCategory';
import { Autocomplete, TextField } from '@mui/material';

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [openAddSubCategoryModal, setOpenAddSubCategoryModal] = useState(false);
  const [approved, setApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const stoken = localStorage.getItem('stoken') || "null";

  const [Product, setProduct] = useState({
    title: "",
    description: "",
    categoryname: "",
    subcategory: "",
    price: "",
    oldprice: "",
    discount: "",
    ingredients: "",
    brand: "",
    size: "",
    additional_details: "",
    stock: "",
    images: []
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    // Filter subcategories based on selected category
    if (Product.categoryname) {
      const filtered = subcategories.filter(
        sub => sub.categoryId === Product.categoryname
      );
      setFilteredSubcategories(filtered);
      
      // Reset subcategory if it doesn't belong to the selected category
      const currentSubcategory = subcategories.find(
        sub => sub._id === Product.subcategory
      );
      if (currentSubcategory && currentSubcategory.categoryId !== Product.categoryname) {
        setProduct(prev => ({ ...prev, subcategory: "" }));
      }
    } else {
      setFilteredSubcategories(subcategories);
    }
  }, [Product.categoryname, subcategories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getcategories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Failed to fetch categories', 'error');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getsubcategories`);
      setSubcategories(response.data);
      setFilteredSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      showNotification('Failed to fetch subcategories', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...Product, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSelectChange = (name) => (event) => {
    setProduct({ ...Product, [name]: event.target.value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageUpload = (files) => {
    const fileList = Array.from(files);
    
    // Check if adding these images would exceed the limit of 5
    if (images.length + fileList.length > 5) {
      showNotification('You can only upload up to 5 images', 'error');
      return;
    }
    
    setImages((prevImages) => [...prevImages, ...fileList]);
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: [...prevProduct.images, ...fileList],
    }));
  };

  const handleImageRemove = (indexToRemove) => {
    const updated = images.filter((_, i) => i !== indexToRemove);
    setImages(updated);
    setProduct((prev) => ({ ...prev, images: updated }));
  };

  useEffect(() => {
    const oldPrice = parseFloat(Product.oldprice);
    const discount = parseFloat(Product.discount);

    if (!isNaN(oldPrice) && !isNaN(discount) && oldPrice > 0 && discount >= 0) {
      const discountedPrice = oldPrice - (oldPrice * discount / 100);
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: discountedPrice.toFixed(2)
      }));
    } else {
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: ""
      }));
    }
  }, [Product.oldprice, Product.discount]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!Product.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    
    if (!Product.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!Product.categoryname) {
      newErrors.categoryname = 'Please select a category';
    }
    
    if (!Product.subcategory) {
      newErrors.subcategory = 'Please select a subcategory';
    }
    
    if (!Product.oldprice || parseFloat(Product.oldprice) <= 0) {
      newErrors.oldprice = 'Please enter a valid price';
    }
    
    if (!Product.stock || parseInt(Product.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }
    
    if (images.length === 0) {
      newErrors.images = 'Please upload at least one product image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addproduct = async () => {
    if (!validateForm()) {
      showNotification('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();

      Object.entries(Product).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, value);
        }
      });

      images.forEach((img) => formData.append("images", img));

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/addproducts`,
        formData,
        { headers: { stoken } }
      );

      if (response.data.success) {
        showNotification("Product added successfully!", "success");
        // Reset form after successful submission
        setProduct({
          title: "",
          description: "",
          categoryname: "",
          subcategory: "",
          price: "",
          oldprice: "",
          discount: "",
          ingredients: "",
          brand: "",
          size: "",
          additional_details: "",
          stock: "",
          images: []
        });
        setImages([]);
      }

    } catch (error) {
      console.error("Error adding product:", error.response || error);
      showNotification(
        error.response?.data?.message || "Failed to add product. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenCategoryModal = () => setOpenAddCategoryModal(true);
  const handleCloseCategoryModal = () => {
    setOpenAddCategoryModal(false);
    fetchCategories();
  };

  const handleOpenSubCategoryModal = () => setOpenAddSubCategoryModal(true);
  const handleCloseSubCategoryModal = () => {
    setOpenAddSubCategoryModal(false);
    fetchSubcategories();
  };

  useEffect(() => {
    fetchSeller();
  }, []);

  const fetchSeller = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/sellerdetails`, { headers: { stoken } });
      if (res.data.success) {
        setApproved(res.data.seller[0].approved);
      }
    } catch (error) {
      console.error("Error fetching seller details:", error);
      showNotification("Failed to verify seller status", "error");
    }
  };

  if (!approved) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">You are not approved to add products. Please contact the administrator for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to list a new product</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); addproduct(); }}>
        {/* Basic Details Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Basic Details</h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
              <input
                type="text"
                name="title"
                value={Product.title}
                onChange={handleChange}
                placeholder="Enter product title"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.title ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={Product.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={4}
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Category & Classification</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleOpenCategoryModal}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <span className="text-lg">+</span> Create New Category
              </button>
              <button
                type="button"
                onClick={handleOpenSubCategoryModal}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <span className="text-lg">+</span> Create New Subcategory
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Autocomplete
                fullWidth
                options={categories}
                getOptionLabel={(option) => option.categoryname}
                value={categories.find(cat => cat._id === Product.categoryname) || null}
                onChange={(event, newValue) => {
                  setProduct({ ...Product, categoryname: newValue ? newValue._id : '' });
                  if (errors.categoryname) {
                    setErrors({ ...errors, categoryname: null });
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Category *" 
                    variant="outlined"
                    error={!!errors.categoryname}
                    helperText={errors.categoryname}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'white',
                      }
                    }}
                  />
                )}
              />

              <FormControl fullWidth error={!!errors.subcategory}>
                <InputLabel>Subcategory *</InputLabel>
                <Select 
                  value={Product.subcategory} 
                  onChange={handleSelectChange('subcategory')}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: 'white',
                  }}
                >
                  {filteredSubcategories.map((sub) => (
                    <MenuItem key={sub._id} value={sub._id}>
                      {sub.subcategory}
                    </MenuItem>
                  ))}
                </Select>
                {errors.subcategory && <p className="mt-1 text-xs text-red-500">{errors.subcategory}</p>}
              </FormControl>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Pricing & Inventory</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final Price</label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={Product.price}
                    readOnly
                    placeholder="₹ 0.00"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Calculated automatically</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="oldprice"
                    value={Product.oldprice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.oldprice ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.oldprice && <p className="mt-1 text-xs text-red-500">{errors.oldprice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                <div className="relative">
                  <input
                    type="number"
                    name="discount"
                    value={Product.discount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full pr-8 px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Available *</label>
              <input
                type="number"
                name="stock"
                value={Product.stock}
                onChange={handleChange}
                placeholder="Enter available quantity"
                min="0"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.stock ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Product Specifications</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                <input
                  type="text"
                  name="ingredients"
                  value={Product.ingredients}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Wood"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={Product.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size / Weight</label>
                <input
                  type="text"
                  name="size"
                  value={Product.size}
                  onChange={handleChange}
                  placeholder="e.g., Large, 500g"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
              <input
                type="text"
                name="additional_details"
                value={Product.additional_details}
                onChange={handleChange}
                placeholder="Any extra information about the product"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Product Images *</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    src={URL.createObjectURL(img)}
                    alt={`preview-${index}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <MdClose className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label htmlFor="multi-img" className="cursor-pointer">
                  <div className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                    <MdOutlineCloudUpload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Upload</span>
                  </div>
                </label>
              )}
              <input
                id="multi-img"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-500">
                {images.length}/5 images uploaded. Recommended size: 800x800px
              </p>
              {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} color="inherit" />
                <span>Uploading Product...</span>
              </>
            ) : (
              <>
                <MdOutlineCloudUpload className="w-5 h-5" />
                <span>Upload Product</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Category Modal */}
      <Modal open={openAddCategoryModal} onClose={handleCloseCategoryModal}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[90%] sm:w-[500px]">
          <AddCategory onSuccess={handleCloseCategoryModal} />
        </Box>
      </Modal>

      {/* Subcategory Modal */}
      <Modal open={openAddSubCategoryModal} onClose={handleCloseSubCategoryModal}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[90%] sm:w-[500px]">
          <AddSubCategory onSubCategoryAdded={handleCloseSubCategoryModal} />
        </Box>
      </Modal>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AddProduct;