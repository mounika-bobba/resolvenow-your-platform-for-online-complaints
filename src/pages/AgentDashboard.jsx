import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Eye,
  User,
  Calendar
} from 'lucide-react'

const AgentDashboard = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentData()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('newComplaintAssigned', (complaint) => {
        toast.success(`New complaint assigned: ${complaint.title}`)
        fetchAgentData()
      })

      socket.on('newMessage', (data) => {
        if (data.complaintId) {
          toast.success(`New message in complaint: ${data.complaintTitle}`)
          fetchAgentData()
        }
      })

      return () => {
        socket.off('newComplaintAssigned')
        socket.off('newMessage')
      }
    }
  }, [socket])

  const fetchAgentData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/agent/complaints'),
        axios.get('http://localhost:5000/api/agent/stats')
      ])

      setComplaints(complaintsRes.data.complaints)
      setStats(statsRes.data.stats)
    } catch (error) {
      toast.error('Failed to fetch agent data')
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (complaintId, status, comment = '') => {
    try {
      await axios.put(`http://localhost:5000/api/agent/complaints/${complaintId}/status`, {
        status,
        comment
      })
      toast.success('Complaint status updated')
      fetchAgentData()
    } catch (error) {
      toast.error('Failed to update complaint status')
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your assigned complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Assigned Complaints</h2>
        </div>
        
        {complaints.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(complaint.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {complaint.title}
                      </h3>
                      <span className={getStatusClass(complaint.status)}>
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{complaint.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <span>ID: {complaint.complaintId}</span>
                      <span>Category: {complaint.category}</span>
                      {complaint.unreadMessages > 0 && (
                        <div className="flex items-center space-x-1 text-primary-600">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{complaint.unreadMessages} new</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                      {complaint.status === 'assigned' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint._id, 'in-progress')}
                          className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                        >
                          Start Working
                        </button>
                      )}
                      
                      {complaint.status === 'in-progress' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                          className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/complaint/${complaint._id}`}
                      className="btn-primary text-sm flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard