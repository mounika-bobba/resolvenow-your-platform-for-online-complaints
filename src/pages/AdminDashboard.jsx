import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  UserPlus,
  Settings,
  Eye,
  UserCheck
} from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    totalAgents: 0
  })
  const [complaints, setComplaints] = useState([])
  const [agents, setAgents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, complaintsRes, agentsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/complaints'),
        axios.get('http://localhost:5000/api/admin/agents'),
        axios.get('http://localhost:5000/api/admin/users')
      ])

      setStats(statsRes.data.stats)
      setComplaints(complaintsRes.data.complaints)
      setAgents(agentsRes.data.agents)
      setUsers(usersRes.data.users)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const assignComplaint = async (complaintId, agentId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/complaints/${complaintId}/assign`, {
        agentId
      })
      toast.success('Complaint assigned successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to assign complaint')
    }
  }

  const createAgent = async (agentData) => {
    try {
      await axios.post('http://localhost:5000/api/admin/agents', agentData)
      toast.success('Agent created successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to create agent')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending'
      case 'assigned':
        return 'status-badge status-assigned'
      case 'in-progress':
        return 'status-badge status-in-progress'
      case 'resolved':
        return 'status-badge status-resolved'
      case 'closed':
        return 'status-badge status-closed'
      default:
        return 'status-badge status-pending'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage complaints, users, and agents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'complaints'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Complaints
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Complaints */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {complaints.slice(0, 5).map((complaint) => (
                <div key={complaint._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(complaint.status)}
                        <h3 className="text-sm font-medium text-gray-900">
                          {complaint.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {complaint.complaintId} • {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={getStatusClass(complaint.status)}>
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Agent Performance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {agents.slice(0, 5).map((agent) => (
                  <div key={agent._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <UserCheck className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {agent.assignedComplaints || 0} assigned
                      </p>
                      <p className="text-xs text-gray-500">
                        {agent.resolvedComplaints || 0} resolved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Complaints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {complaint.complaintId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{complaint.user.name}</div>
                      <div className="text-sm text-gray-500">{complaint.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusClass(complaint.status)}>
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {complaint.assignedAgent ? (
                        <div className="text-sm text-gray-900">
                          {complaint.assignedAgent.name}
                        </div>
                      ) : (
                        <select
                          onChange={(e) => assignComplaint(complaint._id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md"
                          defaultValue=""
                        >
                          <option value="">Assign Agent</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/complaint/${complaint._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Agents</h2>
            <button className="btn-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Agent
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {agents.map((agent) => (
              <div key={agent._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 rounded-full p-3">
                      <UserCheck className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {format(new Date(agent.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {agent.assignedComplaints || 0} Active Cases
                    </p>
                    <p className="text-sm text-gray-500">
                      {agent.resolvedComplaints || 0} Resolved
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.complaintsCount || 0} Complaints
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : user.role === 'agent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard