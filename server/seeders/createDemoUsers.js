const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resolvenow')
    
    // Check if demo users already exist
    const existingAdmin = await User.findOne({ email: 'admin@resolvenow.com' })
    if (existingAdmin) {
      console.log('Demo users already exist')
      process.exit(0)
    }

    // Create demo users
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@resolvenow.com',
        password: 'admin123',
        phone: '+1234567890',
        address: '123 Admin Street, Admin City, AC 12345',
        role: 'admin'
      },
      {
        name: 'Agent Sarah',
        email: 'agent@resolvenow.com',
        password: 'agent123',
        phone: '+1234567891',
        address: '456 Agent Avenue, Agent City, AG 12345',
        role: 'agent'
      },
      {
        name: 'John Customer',
        email: 'user@resolvenow.com',
        password: 'user123',
        phone: '+1234567892',
        address: '789 User Lane, User City, US 12345',
        role: 'user'
      }
    ]

    for (const userData of demoUsers) {
      const user = new User(userData)
      await user.save()
      console.log(`Created ${userData.role}: ${userData.email}`)
    }

    console.log('Demo users created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error creating demo users:', error)
    process.exit(1)
  }
}

createDemoUsers()