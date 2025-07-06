import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FileText, Users, Clock, Shield, MessageSquare, BarChart3 } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: FileText,
      title: 'Easy Complaint Submission',
      description: 'Submit complaints quickly with our user-friendly interface and track them in real-time.'
    },
    {
      icon: Users,
      title: 'Agent Assignment',
      description: 'Complaints are automatically assigned to qualified agents for efficient resolution.'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Monitor the progress of your complaints with live updates and notifications.'
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Chat directly with assigned agents to provide additional information or clarifications.'
    },
    {
      icon: Shield,
      title: 'Secure & Confidential',
      description: 'Your data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive reporting and analytics for administrators and agents.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ResolveNow
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your Platform for Online Complaints Management
            </p>
            <p className="text-lg mb-10 max-w-3xl mx-auto text-primary-50">
              Streamline your complaint resolution process with our comprehensive platform. 
              Submit, track, and resolve complaints efficiently while maintaining transparency and communication.
            </p>
            
            {user ? (
              <div className="space-x-4">
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/submit-complaint"
                  className="bg-primary-500 hover:bg-primary-400 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Submit Complaint
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-primary-500 hover:bg-primary-400 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for efficient complaint management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to get your complaints resolved efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Register Account</h3>
              <p className="text-gray-600">Create your account to get started with complaint submission</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Submit Complaint</h3>
              <p className="text-gray-600">Fill out the complaint form with detailed information</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your complaint status and receive updates</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Resolution</h3>
              <p className="text-gray-600">Receive resolution and provide feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users who trust ResolveNow for their complaint management needs
          </p>
          
          {!user && (
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Create Account Now
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home