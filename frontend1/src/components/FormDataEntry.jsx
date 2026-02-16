import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PRODUCTS_DATA, SOURCES, CATEGORIES } from '../data/productsData';
import { FormSkeleton } from './Skeleton';

const FormDataEntry = () => {
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stores, setStores] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    date_of_visit: new Date().toISOString().split('T')[0],
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    store_name: '',
    customer_name: '',
    mobile_number: '',
    customer_residential_address: '',
    store_remark: '',
    categories: '',
    net_sale_value: '',
    executive_name: '',
    source_of_walkings: '',
    expected_booking_date: '',
    sales_order_number: '',
    delivery_date: '',
    product: {
      product_name: '',
      size: '',
      height: '',
      size_inches: ''
    },
    individual: 0,
    family: 0,
    reason_if_not_interested: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/storeinfo`);
      if (response.data.success) {
        setStores(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setStoresLoading(false);
    }
  };

  const validateMobileNumber = (value) => {
    // Allow only numbers and limit to 10 digits
    const numberOnly = value.replace(/\D/g, '');
    return numberOnly.slice(0, 10);
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!formData.mobile_number) {
      errors.mobile_number = 'Mobile number is required';
    } else if (formData.mobile_number.length !== 10) {
      errors.mobile_number = 'Mobile number must be 10 digits';
    }
    
    if (!formData.categories) {
      errors.categories = 'Category is required';
    }
    
    if (!formData.product.product_name) {
      errors.product_name = 'Product name is required';
    }
    
    if (!formData.product.size) {
      errors.size = 'Size is required';
    }
    
    if (!formData.product.height) {
      errors.height = 'Height is required';
    }
    
    if (!formData.product.size_inches) {
      errors.size_inches = 'Dimensions are required';
    }
    
    if (!formData.store_remark) {
      errors.store_remark = 'Store remark is required';
    }
    
    // Conditional validation based on store_remark
    if (formData.store_remark === 'Deal closed') {
      if (!formData.net_sale_value || parseFloat(formData.net_sale_value) <= 0) {
        errors.net_sale_value = 'Net sale value is required when deal is closed';
      }
      if (!formData.executive_name) {
        errors.executive_name = 'Executive name is required when deal is closed';
      }
    } else if (formData.store_remark === 'Not interested') {
      if (!formData.reason_if_not_interested) {
        errors.reason_if_not_interested = 'Reason is required when not interested';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobile_number') {
      const validatedValue = validateMobileNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: validatedValue
      }));
    } else if (name === 'date_of_visit') {
      // Update day automatically when date changes
      const date = new Date(value);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      setFormData(prev => ({
        ...prev,
        [name]: value,
        day: day
      }));
    } else if (name === 'store_remark') {
      // Clear sales information or reason fields when store remark changes
      let updateData = { [name]: value };
      
      if (value === 'Deal closed') {
        // Clear reason field when Deal closed is selected
        updateData.reason_if_not_interested = '';
      } else if (value === 'Not interested') {
        // Clear sales fields when Not interested is selected
        updateData.net_sale_value = '';
        updateData.executive_name = '';
        updateData.source_of_walkings = '';
        updateData.expected_booking_date = '';
        updateData.sales_order_number = '';
        updateData.delivery_date = '';
        updateData.individual = 0;
        updateData.family = 0;
      } else {
        // Clear both if no selection
        updateData.reason_if_not_interested = '';
        updateData.net_sale_value = '';
        updateData.executive_name = '';
        updateData.source_of_walkings = '';
        updateData.expected_booking_date = '';
        updateData.sales_order_number = '';
        updateData.delivery_date = '';
        updateData.individual = 0;
        updateData.family = 0;
      }
      
      setFormData(prev => ({
        ...prev,
        ...updateData
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductSelect = (e) => {
    const productName = e.target.value;
    const product = PRODUCTS_DATA.find(p => p.name === productName);
    setSelectedProduct(product);
    
    if (product) {
      setFormData(prev => ({
        ...prev,
        product: {
          product_name: productName,
          size: '',
          height: '',
          size_inches: ''
        }
      }));
    }
  };

  const handleProductFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        [name]: value
      }
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/formdata`, {
        ...formData,
        net_sale_value: parseFloat(formData.net_sale_value) || 0,
        individual: parseInt(formData.individual) || 0,
        family: parseInt(formData.family) || 0,
      });

      if (response.data.success) {
        toast.success('Form data submitted successfully!');
        
        // Reset form
        setFormData({
          date_of_visit: new Date().toISOString().split('T')[0],
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          store_name: '',
          customer_name: '',
          mobile_number: '',
          customer_residential_address: '',
          store_remark: '',
          categories: '',
          net_sale_value: '',
          executive_name: '',
          source_of_walkings: '',
          expected_booking_date: '',
          sales_order_number: '',
          delivery_date: '',
          product: {
            product_name: '',
            size: '',
            height: '',
            size_inches: ''
          },
          individual: 0,
          family: 0,
          reason_if_not_interested: ''
        });
        setSelectedProduct(null);
        setValidationErrors({});
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Network error. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date_of_visit: new Date().toISOString().split('T')[0],
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      store_name: '',
      customer_name: '',
      mobile_number: '',
      customer_residential_address: '',
      store_remark: '',
      categories: '',
      net_sale_value: '',
      executive_name: '',
      source_of_walkings: '',
      expected_booking_date: '',
      sales_order_number: '',
      delivery_date: '',
      product: {
        product_name: '',
        size: '',
        height: '',
        size_inches: ''
      },
      individual: 0,
      family: 0,
      reason_if_not_interested: ''
    });
    setSelectedProduct(null);
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {storesLoading ? (
          <FormSkeleton />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Visit Form</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Enter customer and product details</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Date and Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Visit *
                </label>
                <input
                  type="date"
                  name="date_of_visit"
                  value={formData.date_of_visit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day (Auto-populated) *
                </label>
                <input
                  type="text"
                  name="day"
                  value={formData.day}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Store Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <select
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.name}>{store.name}</option>
                ))}
              </select>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      validationErrors.mobile_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                  />
                  {validationErrors.mobile_number && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.mobile_number}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  name="customer_residential_address"
                  value={formData.customer_residential_address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Enter residential address"
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Product Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    validationErrors.categories ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {validationErrors.categories && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.categories}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <select
                  value={formData.product.product_name}
                  onChange={handleProductSelect}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.product_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select product</option>
                  {PRODUCTS_DATA.map(product => (
                    <option key={product.name} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {validationErrors.product_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.product_name}</p>
                )}
              </div>

              {selectedProduct && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <select
                      name="size"
                      value={formData.product.size}
                      onChange={handleProductFieldChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.size ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select size</option>
                      {selectedProduct.sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    {validationErrors.size && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.size}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (inches) *
                      </label>
                      <select
                        name="height"
                        value={formData.product.height}
                        onChange={handleProductFieldChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.height ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select height</option>
                        {selectedProduct.heights.map(height => (
                          <option key={height} value={height}>{height}</option>
                        ))}
                      </select>
                      {validationErrors.height && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.height}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions (W x D) *
                      </label>
                      <select
                        name="size_inches"
                        value={formData.product.size_inches}
                        onChange={handleProductFieldChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.size_inches ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select dimensions</option>
                        {selectedProduct.sizeInches.map(sizeInch => (
                          <option key={sizeInch} value={sizeInch}>{sizeInch}</option>
                        ))}
                      </select>
                      {validationErrors.size_inches && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.size_inches}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Store Remark */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Store Remark</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Remark *
                </label>
                <select
                  name="store_remark"
                  value={formData.store_remark}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.store_remark ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select remark</option>
                  <option value="Deal closed">Deal closed</option>
                  <option value="Not interested">Not interested</option>
                </select>
                {validationErrors.store_remark && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.store_remark}</p>
                )}
              </div>
            </div>

            {/* Conditional Sales Information - Only show if Deal closed */}
            {formData.store_remark === 'Deal closed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Net Sale Value *
                  </label>
                  <input
                    type="number"
                    name="net_sale_value"
                    value={formData.net_sale_value}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.net_sale_value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sale value"
                  />
                  {validationErrors.net_sale_value && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.net_sale_value}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Executive Name *
                  </label>
                  <input
                    type="text"
                    name="executive_name"
                    value={formData.executive_name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.executive_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter executive name"
                  />
                  {validationErrors.executive_name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.executive_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source of Walking
                </label>
                <select
                  name="source_of_walkings"
                  value={formData.source_of_walkings}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select source</option>
                  {SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Booking Date
                  </label>
                  <input
                    type="date"
                    name="expected_booking_date"
                    value={formData.expected_booking_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Order Number
                  </label>
                  <input
                    type="text"
                    name="sales_order_number"
                    value={formData.sales_order_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Individual Count
                  </label>
                  <input
                    type="number"
                    name="individual"
                    value={formData.individual}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Count
                  </label>
                  <input
                    type="number"
                    name="family"
                    value={formData.family}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Conditional Reason - Only show if Not interested */}
            {formData.store_remark === 'Not interested' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Reason</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Not Being Interested *
                </label>
                <textarea
                  name="reason_if_not_interested"
                  value={formData.reason_if_not_interested}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.reason_if_not_interested ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please provide the reason for not being interested"
                />
                {validationErrors.reason_if_not_interested && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.reason_if_not_interested}</p>
                )}
              </div>
            </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default FormDataEntry;
