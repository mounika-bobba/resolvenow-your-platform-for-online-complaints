const express = require('express')
const Complaint = require('../models/Complaint')
const Message = require('../models/Message')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

// Apply auth and agent role requirement to all routes
router.use(auth)
router.use(requireRole(['agent']))

// Get agent's assigned complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedAgent: req.user._id })
      .populate('user', 'name email phone')
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
    console.error('Get agent complaints error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get agent stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { assignedAgent: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const formattedStats = {
      total: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0
    }

    stats.forEach(stat => {
      formattedStats.total += stat.count
      if (stat._id === 'in-progress') {
        formattedStats.inProgress = stat.count
      } else if (stat._id === 'assigned') {
        formattedStats.assigned = stat.count
      } else if (stat._id === 'resolved') {
        formattedStats.resolved = stat.count
      }
    })

    res.json({ stats: formattedStats })
  } catch (error) {
    console.error('Get agent stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update complaint status
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status, comment } = req.body
    
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    // Check if agent is assigned to this complaint
    if (complaint.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const oldStatus = complaint.status
    complaint.status = status
    
    // Add to status history
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
      comment,
      updatedBy: req.user._id
    })

    // If resolving, add resolution info
    if (status === 'resolved') {
      complaint.resolution = {
        description: comment || 'Complaint resolved by agent',
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      }
    }

    await complaint.save()
    await complaint.populate('user', 'name email')

    // Notify user about status change
    const io = req.app.get('io')
    io.to(`user_${complaint.user._id}`).emit('complaintUpdate', complaint)
    io.to(`complaint_${complaint._id}`).emit('complaintUpdate', complaint)

    res.json({ message: 'Complaint status updated successfully', complaint })
  } catch (error) {
    console.error('Update complaint status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router