import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import axios from 'axios'
import { Plus, FileText, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
    fetchStats()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('complaintUpdate', (updatedComplaint) => {
        setComplaints(prev => 
          prev.map(complaint => 
            complaint._id === updatedComplaint._id ? updatedComplaint : complaint
          )
        )
        toast.success('Complaint status updated!')
      })

      socket.on('newMessage', (data) => {
        toast.success(`New message from ${data.senderName}`)
      })

      return () => {
        socket.off('complaintUpdate')
        socket.off('newMessage')
      }
    }
  }, [socket])

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/complaints/my-complaints')
      setComplaints(response.data.complaints)
    } catch (error) {
      toast.error('Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/complaints/my-stats')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'assigned':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your complaints and track their progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Link
          to="/submit-complaint"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Submit New Complaint</span>
        </Link>
      </div>

      {/* Complaints List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Complaints</h2>
        </div>
        
        {complaints.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints submitted yet</p>
            <Link
              to="/submit-complaint"
              className="btn-primary mt-4 inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Submit Your First Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(complaint.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {complaint.title}
                      </h3>
                      <span className={getStatusClass(complaint.status)}>
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>ID: {complaint.complaintId}</span>
                      <span>Category: {complaint.category}</span>
                      <span>Priority: {complaint.priority}</span>
                      <span>Created: {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                      {complaint.assignedAgent && (
                        <span>Agent: {complaint.assignedAgent.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {complaint.unreadMessages > 0 && (
                      <div className="flex items-center space-x-1 text-primary-600">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-medium">{complaint.unreadMessages}</span>
                      </div>
                    )}
                    
                    <Link
                      to={`/complaint/${complaint._id}`}
                      className="btn-primary text-sm"
                    >
                      View Details
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

export default Dashboard