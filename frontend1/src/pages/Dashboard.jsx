import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Users, TrendingUp, Target, IndianRupee, ShoppingCart,
  ArrowLeft, Activity, TrendingDown, Package, Home as HomeIcon,
  BarChart3, UserCheck, MapPin, Table, Clock, Calendar, Truck, User, LogOut
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leadsData, setLeadsData] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    if (storeId) {
      fetchStoreInfo();
    }
  }, [storeId]);

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeadsData();
    }
  }, [activeTab, storeId, storeInfo, fromDate, toDate]);

  const fetchStoreInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/storeinfo/${storeId}`);
      if (response.data.success) {
        setStoreInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (storeId) {
        // Get store name first
        const storeResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/storeinfo/${storeId}`);
        if (storeResponse.data.success) {
          params.append('store_name', storeResponse.data.data.name);
        }
      }
      
      // Add date filters if provided
      if (fromDate) {
        params.append('start_date', fromDate);
      }
      if (toDate) {
        params.append('end_date', toDate);
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/statistics/dashboard?${params}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsData = async () => {
    setLoadingLeads(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/formdata`);
      if (response.data.success) {
        let leads = response.data.data || [];
        
        // Filter by store if storeId is provided
        if (storeId && storeInfo) {
          leads = leads.filter(lead => lead.store_name === storeInfo.name);
        }
        
        // Filter by date range if provided
        if (fromDate || toDate) {
          leads = leads.filter(lead => {
            const leadDate = lead.date_of_visit;
            if (fromDate && leadDate < fromDate) return false;
            if (toDate && leadDate > toDate) return false;
            return true;
          });
        }
        
        // Sort by date (newest first)
        leads.sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit));
        
        setLeadsData(leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads data');
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleApplyFilter = () => {
    fetchDashboardStats();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Always visible */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <div className="bg-gray-200 h-5 sm:h-6 w-32 sm:w-48 rounded animate-pulse mb-1"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 w-24 sm:w-32 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Date Filter - Always visible */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50"
                  />
                </div>
                <button
                  disabled
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                >
                  Loading...
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton for Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Skeleton for Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200 p-4">
              <div className="flex space-x-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-4 w-20 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <ChartSkeleton height="300px" />
            </div>
          </div>

          {/* Skeleton for Table */}
          <TableSkeleton rows={6} columns={5} />
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">No data available</div>
      </div>
    );
  }

  const { summary, source_distribution, category_performance, executive_performance, loss_analysis, product_performance, sales_trend, location_conversion, delivery_performance } = stats;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products & Categories', icon: Package },
    { id: 'performance', label: 'Team Performance', icon: UserCheck },
    { id: 'customers', label: 'Customer Analytics', icon: Users },
    { id: 'leads', label: 'Lead Table', icon: Table }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <img
                src="https://customer-assets.emergentagent.com/job_25966e6c-95dc-4b4b-8eea-a1bb89d83ab3/artifacts/b4ukc74y_NILKAMAL_SLEEP_CTC_Horizontal_5d55e449-c026-4cb3-a9e7-1031813a203c_Logo.png"
                alt="Nilkamal Sleep"
                className="h-6 sm:h-8 md:h-10 object-contain"
              />
              <div className="hidden lg:block h-8 w-px bg-gray-200" />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  {storeId && storeInfo ? storeInfo.name : 'All Stores'} - Analytics
                </h1>
                <p className="hidden sm:block text-xs sm:text-sm text-gray-600">
                  {storeId && storeInfo ? storeInfo.address : 'Complete network overview'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="flex items-center px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm sm:text-base"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Stores</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">{user?.full_name || 'User'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b">
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="border-t border-gray-200 py-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleApplyFilter}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filter
                </button>
                {(fromDate || toDate) && (
                  <button
                    onClick={handleClearFilter}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Walk-ins</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_walkins}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.total_revenue)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <IndianRupee className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{summary.conversion_rate}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Ticket Size</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.avg_ticket_size)}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <ShoppingCart className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 - Sales Trend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Current Month)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(sales_trend || []).map((item) => {
                  // Format the expected booking date for display
                  const date = new Date(item.date);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  return {
                    date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
                    revenue: item.revenue || 0,
                    bookings: item.bookings || 0
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(value) => {
                      if (value >= 100000) return `${(value/100000).toFixed(1)}L`;
                      if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
                      return value.toString();
                    }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#4F46E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source of Walk-ins Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Source of Walk-ins
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={source_distribution.slice(0,6).map(s => ({ name: s.name, value: s.value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {source_distribution.slice(0,6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Lead Funnel Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: 'Deal Closed', count: summary.total_bookings },
                    { status: 'Interested', count: Math.floor(summary.total_walkins * 0.4) },
                    { status: 'Not Interested', count: summary.total_walkins - summary.total_bookings - Math.floor(summary.total_walkins * 0.4) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10B981" name="Leads">
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Executive Performance & Loss Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Executives</h3>
                <div className="space-y-3">
                  {executive_performance.slice(0, 5).map((exec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{exec.name}</p>
                        <p className="text-sm text-gray-600">{exec.total_leads} leads • {exec.bookings} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{exec.conversion_rate}%</p>
                        <p className="text-sm text-gray-600">{formatCurrency(exec.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Loss Reasons
                </h3>
                <div className="space-y-3 max-h-75 overflow-y-auto">
                  {loss_analysis.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-gray-900 text-sm">{item.reason}</p>
                      <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Top Products
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={product_performance.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product" type="category" width={120} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={category_performance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={0} textAnchor="middle" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8B5CF6" name="Total Leads" />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TEAM PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Executive Leaderboard */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Executive Leaderboard
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={executive_performance.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Revenue') return [formatCurrency(value), name];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="revenue" name="Revenue">
                      {executive_performance.slice(0, 10).map((entry, index) => {
                        // Generate gradient colors from dark to light
                        const opacity = 1 - (index * 0.08); // Decreases from 1 to ~0.28
                        const baseColor = '#3B82F6'; // Blue
                        return <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${opacity})`} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Executive Performance (Leads Touched) */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Executive Performance (Leads Touched)
                </h3>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executive</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Deal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {executive_performance.map((exec, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exec.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exec.total_leads}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exec.bookings}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {exec.conversion_rate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {exec.bookings > 0 ? formatCurrency(exec.revenue / exec.bookings) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Customer Lifecycle & Delivery Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Customer Lifecycle & Delivery Performance
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visit to Delivery Time */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Visit to Delivery Time
                  </h4>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {delivery_performance?.avg_days || 0}
                      </div>
                      <div className="text-sm text-gray-500">Avg. Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {delivery_performance?.min_days || 0}
                      </div>
                      <div className="text-sm text-gray-500">Min Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {delivery_performance?.max_days || 0}
                      </div>
                      <div className="text-sm text-gray-500">Max Days</div>
                    </div>
                  </div>
                  
                  {/* Distribution */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">DISTRIBUTION</h5>
                    {Object.entries(delivery_performance?.distribution || {}).map(([range, count]) => (
                      <div key={range} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 w-16">{range} days</span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${count > 0 ? Math.max((count / (delivery_performance?.total_deliveries || 1)) * 100, 5) : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Team Delivery Time */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Team Delivery Time
                  </h4>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {delivery_performance?.avg_days || 0}
                      </div>
                      <div className="text-sm text-gray-500">Avg. Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {delivery_performance?.total_deliveries || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Deliveries</div>
                    </div>
                  </div>
                  
                  {/* On-time vs Delayed */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">On-time (≤7 days)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {delivery_performance?.on_time || 0}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({delivery_performance?.total_deliveries > 0 ? 
                            Math.round((delivery_performance.on_time / delivery_performance.total_deliveries) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-700">Delayed (&gt;7 days)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {delivery_performance?.delayed || 0}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({delivery_performance?.total_deliveries > 0 ? 
                            Math.round((delivery_performance.delayed / delivery_performance.total_deliveries) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-4 flex">
                        <div 
                          className="bg-green-500"
                          style={{ 
                            width: `${delivery_performance?.total_deliveries > 0 ? 
                              (delivery_performance.on_time / delivery_performance.total_deliveries) * 100 : 0}%` 
                          }}
                        ></div>
                        <div 
                          className="bg-orange-500"
                          style={{ 
                            width: `${delivery_performance?.total_deliveries > 0 ? 
                              (delivery_performance.delayed / delivery_performance.total_deliveries) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER ANALYTICS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Type Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Customer Type Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Family', value: summary.family_count },
                        { name: 'Individual', value: summary.individual_count }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name}: ${entry.value} (${((entry.value / (summary.family_count + summary.individual_count)) * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Location to Conversion Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location to Conversion
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={(location_conversion || []).slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="location" type="category" width={120} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Conversion Rate']}
                      labelFormatter={(label) => `Location: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="conversion_rate" name="Conversion Rate">
                      {(location_conversion || []).slice(0, 10).map((entry, index) => {
                        const conversionRate = entry.conversion_rate;
                        let color = '#EF4444'; // Red for <30%
                        
                        if (conversionRate >= 50) {
                          color = '#10B981'; // Green for ≥50%
                        } else if (conversionRate >= 30) {
                          color = '#F59E0B'; // Orange for 30-50%
                        }
                        
                        // Apply opacity gradient based on position
                        const opacity = 1 - (index * 0.08);
                        return <Cell key={`cell-${index}`} fill={`${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>≥50% (High)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>30-50% (Medium)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>&lt;30% (Low)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* LEAD TABLE TAB */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Table className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Lead Details ({leadsData.length} leads)
              </h3>
            </div>
            
            {loadingLeads ? (
              <div className="p-4 sm:p-6">
                <TableSkeleton rows={10} columns={6} />
              </div>
            ) : leadsData.length === 0 ? (
              <div className="text-center py-12">
                <Table className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 px-4">No leads found for the selected criteria</p>
                <p className="text-sm text-gray-400 mt-2 px-4">Try adjusting your date filters or check other stores</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executive</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leadsData.map((lead, index) => (
                        <tr key={lead.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(lead.date_of_visit).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.customer_name}</div>
                              {lead.pincode && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {lead.pincode}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.mobile_number}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {lead.product?.product_name && (
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.product.product_name}
                                </div>
                              )}
                              {(lead.product?.size || lead.product?.height) && (
                                <div className="text-sm text-gray-500">
                                  {lead.product.size} - {lead.product.height}" - {lead.product.size_inches}
                                </div>
                              )}
                              {lead.categories && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                  {lead.categories}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.executive_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(lead.net_sale_value || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.store_remark === 'Deal closed' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Deal Closed
                              </span>
                            ) : lead.store_remark === 'Not interested' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Not Interested
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                In Progress
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.source_of_walkings || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {leadsData.map((lead, index) => (
                    <div key={lead.id || index} className="p-4 sm:p-6 hover:bg-gray-50">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{lead.customer_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(lead.date_of_visit).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {lead.store_remark === 'Deal closed' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Closed
                            </span>
                          ) : lead.store_remark === 'Not interested' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Lost
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile</label>
                          <p className="text-sm text-gray-900 mt-1">{lead.mobile_number}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Executive</label>
                          <p className="text-sm text-gray-900 mt-1">{lead.executive_name}</p>
                        </div>
                      </div>

                      {/* Pincode */}
                      {lead.pincode && (
                        <div className="mb-3">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pincode</label>
                          <p className="text-sm text-gray-900 mt-1">{lead.pincode}</p>
                        </div>
                      )}

                      {/* Product Details */}
                      {lead.product?.product_name && (
                        <div className="mb-3">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product</label>
                          <div className="mt-1">
                            <p className="text-sm font-medium text-gray-900">{lead.product.product_name}</p>
                            {(lead.product?.size || lead.product?.height) && (
                              <p className="text-sm text-gray-600">
                                {lead.product.size} - {lead.product.height}" - {lead.product.size_inches}
                              </p>
                            )}
                            {lead.categories && (
                              <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                {lead.categories}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bottom Row - Value and Source */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sale Value</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(lead.net_sale_value || 0)}</p>
                        </div>
                        <div className="text-right">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
                          <p className="text-sm text-gray-600 mt-1">{lead.source_of_walkings || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet Compact Table View */}
                <div className="hidden md:block lg:hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leadsData.map((lead, index) => (
                        <tr key={lead.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(lead.date_of_visit).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.customer_name}</div>
                              <div className="text-sm text-gray-500">{lead.mobile_number}</div>
                              <div className="text-xs text-gray-500">{lead.executive_name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              {lead.product?.product_name && (
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                  {lead.product.product_name}
                                </div>
                              )}
                              {lead.categories && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded mt-1 inline-block">
                                  {lead.categories}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(lead.net_sale_value || 0)}
                          </td>
                          <td className="px-4 py-4">
                            {lead.store_remark === 'Deal closed' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Closed
                              </span>
                            ) : lead.store_remark === 'Not interested' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Lost
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
