const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('joinComplaint', (complaintId) => {
    socket.join(`complaint_${complaintId}`)
    console.log(`User joined complaint room: ${complaintId}`)
  })

  socket.on('leaveComplaint', (complaintId) => {
    socket.leave(`complaint_${complaintId}`)
    console.log(`User left complaint room: ${complaintId}`)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/agent', require('./routes/agent'))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resolvenow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})