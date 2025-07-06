import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FileText, Upload, X } from 'lucide-react'

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    contactMethod: 'email'
  })
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const categories = [
    'Product Quality',
    'Service Issue',
    'Billing Problem',
    'Delivery Issue',
    'Technical Support',
    'Account Problem',
    'Refund Request',
    'Other'
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })
      
      attachments.forEach(file => {
        submitData.append('attachments', file)
      })

      const response = await axios.post('http://localhost:5000/api/complaints', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Complaint submitted successfully!')
      navigate(`/complaint/${response.data.complaint._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit New Complaint</h1>
        <p className="text-gray-600 mt-2">Provide detailed information about your issue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Complaint Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Brief summary of your complaint"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                className="input-field mt-1"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Please provide a detailed description of your complaint, including any relevant dates, order numbers, or other information that might help us resolve your issue."
              />
            </div>

            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700">
                Preferred Contact Method
              </label>
              <select
                id="contactMethod"
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both Email and Phone</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload any relevant documents, images, or files that support your complaint (Max 5MB per file)
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF, DOC up to 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubmitComplaint