import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  MessageSquare, 
  Send, 
  FileText, 
  Download,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ComplaintDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  
  const [complaint, setComplaint] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    fetchComplaintDetails()
    fetchMessages()
  }, [id])

  useEffect(() => {
    if (socket) {
      socket.join(`complaint_${id}`)
      
      socket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      })

      socket.on('complaintUpdate', (updatedComplaint) => {
        setComplaint(updatedComplaint)
      })

      return () => {
        socket.leave(`complaint_${id}`)
        socket.off('newMessage')
        socket.off('complaintUpdate')
      }
    }
  }, [socket, id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchComplaintDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}`)
      setComplaint(response.data.complaint)
    } catch (error) {
      toast.error('Failed to fetch complaint details')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}/messages`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      await axios.post(`http://localhost:5000/api/complaints/${id}/messages`, {
        message: newMessage
      })
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    
    try {
      await axios.post(`http://localhost:5000/api/complaints/${id}/feedback`, {
        rating,
        feedback
      })
      toast.success('Feedback submitted successfully!')
      fetchComplaintDetails()
    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
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

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complaint not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{complaint.title}</h1>
            <p className="text-gray-600 mt-1">Complaint ID: {complaint.complaintId}</p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(complaint.status)}
            <span className={getStatusClass(complaint.status)}>
              {complaint.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Complaint Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-gray-900">{complaint.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <p className="text-gray-900 capitalize">{complaint.priority}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-gray-900">{format(new Date(complaint.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">{format(new Date(complaint.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
              <p className="text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Attachments</p>
                <div className="space-y-2">
                  {complaint.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.originalName}</span>
                      </div>
                      <a
                        href={`http://localhost:5000${attachment.path}`}
                        download
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === user._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.sender.name}
                          </span>
                          <span className="text-xs opacity-75">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {complaint.status !== 'closed' && (
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          {complaint.status === 'resolved' && !complaint.feedback && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Provide Feedback</h2>
              
              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate your experience
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                    Additional Comments
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="input-field mt-1"
                    placeholder="Share your experience with the resolution process..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback || rating === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          )}

          {/* Display Feedback */}
          {complaint.feedback && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Feedback</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= complaint.feedback.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {complaint.feedback.comment && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comments</p>
                    <p className="text-gray-900">{complaint.feedback.comment}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Agent */}
          {complaint.assignedAgent && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Agent</h3>
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 rounded-full p-2">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{complaint.assignedAgent.name}</p>
                  <p className="text-sm text-gray-600">{complaint.assignedAgent.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {complaint.statusHistory?.map((history, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(history.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {history.status.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(history.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {history.comment && (
                      <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintDetails