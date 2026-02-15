import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Target, Users, 
  IndianRupee, ArrowRight, MapPin, Plus, Store
} from 'lucide-react';
import { toast } from 'react-toastify';

const Home = () => {
  const navigate = useNavigate();
  const [storesData, setStoresData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    fixedcost: 0,
    address: ''
  });

  useEffect(() => {
    fetchStoresOverview();
  }, []);

  const fetchStoresOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add date filters if provided
      if (fromDate) {
        params.append('start_date', fromDate);
      }
      if (toDate) {
        params.append('end_date', toDate);
      }
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/statistics/stores-overview?${params}`);
      if (response.data.success) {
        setStoresData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stores overview:', error);
      toast.error('Failed to load stores data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchStoresOverview();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fixedcost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/storeinfo`, formData);
      if (response.data.success) {
        toast.success('Store added successfully!');
        setShowAddModal(false);
        setFormData({ name: '', fixedcost: 0, address: '' });
        fetchStoresOverview();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add store');
    }
  };

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)} K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'profit':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: TrendingUp };
      case 'loss':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: TrendingDown };
      default:
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Target };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'profit': return 'Profitable';
      case 'loss': return 'Loss';
      default: return 'Break Even';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading stores...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img
                src="https://customer-assets.emergentagent.com/job_25966e6c-95dc-4b4b-8eea-a1bb89d83ab3/artifacts/b4ukc74y_NILKAMAL_SLEEP_CTC_Horizontal_5d55e449-c026-4cb3-a9e7-1031813a203c_Logo.png"
                alt="Nilkamal Sleep"
                className="h-8 sm:h-10 object-contain"
              />
              <div className="hidden md:block h-8 w-px bg-gray-200" />
              <h1 className="hidden md:block text-xl font-bold text-gray-900">Store Network Overview</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                View All Analytics
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="border-t border-gray-200 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filter
              </button>
              {(fromDate || toDate) && (
                <button
                  onClick={() => {
                    handleClearFilter();
                    setTimeout(() => fetchStoresOverview(), 100);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(storesData?.total_revenue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <IndianRupee className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total P&L</p>
                <p className={`text-2xl font-bold mt-2 ${storesData?.total_pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {storesData?.total_pnl >= 0 ? '+' : ''}{formatCurrency(storesData?.total_pnl || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${storesData?.total_pnl >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {storesData?.total_pnl >= 0 
                  ? <TrendingUp className="w-6 h-6 text-emerald-600" />
                  : <TrendingDown className="w-6 h-6 text-red-600" />
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Profitable Stores</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  {storesData?.profitable_stores || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Loss-Making Stores</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {storesData?.loss_stores || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Store className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Store Cards */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Health Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storesData?.stores?.map((store) => {
            const statusStyle = getStatusColor(store.status);
            const StatusIcon = statusStyle.icon;
            
            return (
              <div
                key={store.id}
                className={`bg-white rounded-lg border-2 ${statusStyle.border} shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer`}
                onClick={() => navigate(`/dashboard/${store.id}`)}
              >
                {/* Status Bar */}
                <div className={`${statusStyle.bg} px-6 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${statusStyle.text}`} />
                    <span className={`text-sm font-semibold ${statusStyle.text}`}>
                      {getStatusLabel(store.status)}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${statusStyle.text}`}>
                    P&L: {store.pnl >= 0 ? '+' : ''}{formatCurrency(store.pnl)}
                  </span>
                </div>

                {/* Store Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {store.address || store.location || 'No address'}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                      View Details
                      <ArrowRight className="w-3 h-3 inline ml-1" />
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Fixed Cost</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {formatCurrency(store.fixed_cost || store.fixedcost || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Total Sales</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {formatCurrency(store.total_sales || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Conversion</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {store.conversion_rate || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Walk-ins Info */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{store.total_walkins || 0} Walk-ins</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {store.total_bookings || store.conversions || 0} Conversions
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-200 border border-emerald-400" />
            <span>Profit (P&L &gt; ₹0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-200 border border-amber-400" />
            <span>Break Even</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200 border border-red-400" />
            <span>Loss (P&L &lt; ₹0)</span>
          </div>
        </div>
      </main>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Store</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nilkamal Sleep Nova"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Cost (₹) *
                </label>
                <input
                  type="number"
                  name="fixedcost"
                  value={formData.fixedcost}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter store address"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
