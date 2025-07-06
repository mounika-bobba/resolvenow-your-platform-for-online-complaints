# ResolveNow - Online Complaint Management System

A comprehensive platform for managing customer complaints with real-time tracking, agent assignment, and administrative oversight.

## Features

### User Features
- **User Registration & Authentication**: Secure account creation and login
- **Complaint Submission**: Detailed complaint forms with file attachments
- **Real-time Tracking**: Track complaint status and progress
- **Direct Communication**: Chat with assigned agents
- **Feedback System**: Rate and review complaint resolution

### Agent Features
- **Agent Dashboard**: View assigned complaints and statistics
- **Complaint Management**: Update status and communicate with users
- **Real-time Notifications**: Get notified of new assignments and messages

### Admin Features
- **Admin Dashboard**: Comprehensive overview of all complaints and users
- **Agent Management**: Create and manage agent accounts
- **Complaint Assignment**: Assign complaints to appropriate agents
- **Analytics**: View system statistics and performance metrics

## Technical Architecture

### Frontend
- **React 18** with modern hooks and context API
- **Tailwind CSS** for responsive, modern UI design
- **React Router** for client-side routing
- **Socket.io Client** for real-time communication
- **Axios** for HTTP requests
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Key Features Implementation
- **Real-time Updates**: Socket.io for instant notifications
- **File Upload**: Support for complaint attachments
- **Role-based Access**: Different interfaces for users, agents, and admins
- **Status Tracking**: Complete complaint lifecycle management
- **Secure Authentication**: JWT-based auth with password hashing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string and other settings

3. Create demo users:
   ```bash
   node server/seeders/createDemoUsers.js
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```

### Frontend Setup
1. Start the development server:
   ```bash
   npm run dev
   ```

## Demo Accounts

### Admin Account
- **Email**: admin@resolvenow.com
- **Password**: admin123
- **Access**: Full system administration

### Agent Account
- **Email**: agent@resolvenow.com
- **Password**: agent123
- **Access**: Complaint management and user communication

### User Account
- **Email**: user@resolvenow.com
- **Password**: user123
- **Access**: Complaint submission and tracking

## Usage Scenario

### Customer Journey (John's Story)
1. **Registration**: John creates an account on the platform
2. **Complaint Submission**: He submits a detailed complaint about a defective product
3. **Tracking**: John tracks his complaint status in real-time
4. **Communication**: He chats with assigned agent Sarah
5. **Resolution**: Receives resolution and provides feedback

### Agent Workflow (Sarah's Process)
1. **Assignment**: Receives notification of new complaint assignment
2. **Review**: Examines complaint details and attachments
3. **Communication**: Contacts John through built-in messaging
4. **Resolution**: Updates complaint status and provides solution
5. **Closure**: Marks complaint as resolved

### Admin Oversight
1. **Monitoring**: Views all complaints and system statistics
2. **Assignment**: Assigns complaints to appropriate agents
3. **Management**: Creates new agent accounts and manages users
4. **Analytics**: Reviews system performance and metrics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get complaint details
- `POST /api/complaints/:id/messages` - Send message
- `POST /api/complaints/:id/feedback` - Submit feedback

### Admin Routes
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/complaints` - Get all complaints
- `POST /api/admin/complaints/:id/assign` - Assign complaint to agent
- `POST /api/admin/agents` - Create new agent

### Agent Routes
- `GET /api/agent/complaints` - Get assigned complaints
- `PUT /api/agent/complaints/:id/status` - Update complaint status

## Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input validation and sanitization
- **File Upload Security**: File type and size restrictions
- **Password Security**: bcrypt hashing with salt

## Real-time Features

- **Live Notifications**: Instant updates for status changes
- **Real-time Messaging**: Direct communication between users and agents
- **Status Updates**: Live complaint status tracking
- **Dashboard Updates**: Real-time statistics and metrics

## File Structure

```
resolvenow/
├── server/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── seeders/         # Database seeders
│   └── index.js         # Server entry point
├── src/
│   ├── components/      # Reusable React components
│   ├── contexts/        # React context providers
│   ├── pages/           # Page components
│   └── App.jsx          # Main app component
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.