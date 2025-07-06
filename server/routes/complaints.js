const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Complaint = require('../models/Complaint')
const Message = require('../models/Message')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/complaints'
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Create complaint
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category, priority, contactMethod } = req.body

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      contactMethod,
      user: req.user._id
    })

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      complaint.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/complaints/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }))
    }

    // Add initial status to history
    complaint.statusHistory.push({
      status: 'pending',
      timestamp: new Date()
    })

    await complaint.save()
    await complaint.populate('user', 'name email')

    // Emit to admin/agents about new complaint
    const io = req.app.get('io')
    io.emit('newComplaint', complaint)

    res.status(201).json({ complaint })
  } catch (error) {
    console.error('Create complaint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's complaints
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })

    // Add unread message count for each complaint
    const complaintsWithUnread = await Promise.all(
      complaints.map(async (complaint) => {
        const unreadCount = await Message.countDocuments({
          complaint: complaint._id,
          sender: { $ne: req.user._id },
          'readBy.user': { $ne: req.user._id }
        })
        
        return {
          ...complaint.toObject(),
          unreadMessages: unreadCount
        }
      })
    )

    res.json({ complaints: complaintsWithUnread })
  } catch (error) {
    console.error('Get complaints error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's complaint stats
router.get('/my-stats', auth, async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const formattedStats = {
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    }

    stats.forEach(stat => {
      formattedStats.total += stat.count
      if (stat._id === 'in-progress') {
        formattedStats.inProgress = stat.count
      } else {
        formattedStats[stat._id] = stat.count
      }
    })

    res.json({ stats: formattedStats })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('assignedAgent', 'name email')

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check if user has access to this complaint
    if (complaint.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        (req.user.role !== 'agent' || complaint.assignedAgent?._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ complaint })
  } catch (error) {
    console.error('Get complaint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get complaint messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check access
    if (complaint.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        (req.user.role !== 'agent' || complaint.assignedAgent?.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const messages = await Message.find({ complaint: req.params.id })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })

    // Mark messages as read by current user
    await Message.updateMany(
      { 
        complaint: req.params.id,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    )

    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message } = req.body
    
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name')
      .populate('assignedAgent', 'name')
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check access
    if (complaint.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        (req.user.role !== 'agent' || complaint.assignedAgent?._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const newMessage = new Message({
      complaint: req.params.id,
      sender: req.user._id,
      message
    })

    await newMessage.save()
    await newMessage.populate('sender', 'name email role')

    // Emit to complaint room
    const io = req.app.get('io')
    io.to(`complaint_${req.params.id}`).emit('newMessage', newMessage)

    // Notify other participants
    const recipients = []
    if (complaint.user._id.toString() !== req.user._id.toString()) {
      recipients.push(complaint.user._id)
    }
    if (complaint.assignedAgent && complaint.assignedAgent._id.toString() !== req.user._id.toString()) {
      recipients.push(complaint.assignedAgent._id)
    }

    recipients.forEach(userId => {
      io.to(`user_${userId}`).emit('newMessage', {
        complaintId: req.params.id,
        complaintTitle: complaint.title,
        senderName: req.user.name,
        message
      })
    })

    res.status(201).json({ message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Submit feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body
    
    const complaint = await Complaint.findById(req.params.id)
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check if user owns this complaint
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Check if complaint is resolved
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only provide feedback for resolved complaints' })
    }

    complaint.feedback = {
      rating,
      comment: feedback,
      submittedAt: new Date()
    }

    // Update status to closed after feedback
    complaint.status = 'closed'
    complaint.statusHistory.push({
      status: 'closed',
      timestamp: new Date(),
      comment: 'Complaint closed after feedback submission'
    })

    await complaint.save()

    res.json({ message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Submit feedback error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router