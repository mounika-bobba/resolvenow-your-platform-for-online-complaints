const express = require('express')
const User = require('../models/User')
const Complaint = require('../models/Complaint')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

// Apply auth and admin role requirement to all routes
router.use(auth)
router.use(requireRole(['admin']))

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalComplaints, pendingComplaints, resolvedComplaints, totalUsers, totalAgents] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' })
    ])

    const stats = {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalUsers,
      totalAgents
    }

    res.json({ stats })
  } catch (error) {
    console.error('Get admin stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })

    res.json({ complaints })
  } catch (error) {
    console.error('Get complaints error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password')
    
    // Get complaint counts for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedComplaints = await Complaint.countDocuments({ 
          assignedAgent: agent._id,
          status: { $in: ['assigned', 'in-progress'] }
        })
        const resolvedComplaints = await Complaint.countDocuments({ 
          assignedAgent: agent._id,
          status: 'resolved'
        })
        
        return {
          ...agent.toObject(),
          assignedComplaints,
          resolvedComplaints
        }
      })
    )

    res.json({ agents: agentsWithStats })
  } catch (error) {
    console.error('Get agents error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    
    // Get complaint counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const complaintsCount = await Complaint.countDocuments({ user: user._id })
        
        return {
          ...user.toObject(),
          complaintsCount
        }
      })
    )

    res.json({ users: usersWithStats })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Assign complaint to agent
router.post('/complaints/:id/assign', async (req, res) => {
  try {
    const { agentId } = req.body
    
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    const agent = await User.findById(agentId)
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ message: 'Invalid agent' })
    }

    complaint.assignedAgent = agentId
    complaint.status = 'assigned'
    complaint.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      comment: `Assigned to agent: ${agent.name}`,
      updatedBy: req.user._id
    })

    await complaint.save()
    await complaint.populate('assignedAgent', 'name email')

    // Notify agent
    const io = req.app.get('io')
    io.to(`user_${agentId}`).emit('newComplaintAssigned', complaint)

    res.json({ message: 'Complaint assigned successfully', complaint })
  } catch (error) {
    console.error('Assign complaint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new agent
router.post('/agents', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const agent = new User({
      name,
      email,
      password,
      phone,
      address,
      role: 'agent'
    })

    await agent.save()

    res.status(201).json({ message: 'Agent created successfully', agent: { ...agent.toObject(), password: undefined } })
  } catch (error) {
    console.error('Create agent error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router