# Development Server Setup Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Backend Server Setup

```bash
# Install backend dependencies (from root directory)
npm install

# Set up environment variables
# Create .env file with:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wateen_watify
DB_USER=postgres
DB_PASSWORD=alihassan
JWT_SECRET=3724e73b0e5a10f63c4c0402be6461b43eb55b14162c18222c9dedb7a2a8689d3a16c6466254e3b89ebb539b45c917622dcdb7f91e6fed51acfdd0af49bfabca
PORT=5000
NODE_ENV=development

# Initialize database
npm run db:init

# Start backend server
npm run dev
```

The backend server will start on: http://localhost:5000

### 2. Frontend Server Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install --legacy-peer-deps

# Start frontend server
npm start
```

The frontend server will start on: http://localhost:3000

## Server Status & Testing

### Backend Endpoints
- Health Check: http://localhost:5000/health
- API Welcome: http://localhost:5000/api
- Auth Register: http://localhost:5000/api/auth/register
- Auth Login: http://localhost:5000/api/auth/login
- User Profile: http://localhost:5000/api/auth/profile

### Frontend Routes
- Home Page: http://localhost:3000/
- Login Page: http://localhost:3000/login (UI pending)
- Register Page: http://localhost:3000/register (UI pending)
- Dashboard: http://localhost:3000/dashboard (protected)

### Testing Backend Connection

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API welcome
curl http://localhost:5000/api

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend-Backend Connection

The frontend automatically tests the backend connection when loaded. Check the browser console for connection test results:

- ✅ Health Check: Tests basic server connectivity
- ✅ Welcome API: Tests API endpoint availability  
- ✅ API Service: Validates axios configuration

## Development Workflow

### Both Servers Running
1. **Terminal 1** (Backend): `npm run dev` from root directory
2. **Terminal 2** (Frontend): `npm start` from frontend directory

### Backend Features Available
- ✅ User registration and authentication
- ✅ JWT token-based auth
- ✅ PostgreSQL database integration
- ✅ Password hashing with bcrypt
- ✅ Input validation and error handling
- ✅ CORS enabled for frontend
- ✅ Health monitoring
- ✅ Database initialization scripts

### Frontend Features Available
- ✅ React Router setup with protected routes
- ✅ Material-UI theming and components
- ✅ Authentication context and state management
- ✅ API service with axios interceptors
- ✅ Toast notifications
- ✅ React Query for data fetching
- ✅ Responsive design
- ✅ Backend connection testing
- ⏳ Login/Register UI (pending user-provided design)

## Database Scripts

```bash
# Initialize database and create tables
npm run db:init

# Test database connection
npm run db:test

# Reset database (drops and recreates tables)
npm run db:reset

# Test all API endpoints
npm run test:api
```

## Project Structure

```
wateen_watify/
├── backend/                 # Backend API server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── config/            # Database config
│   ├── scripts/           # Utility scripts
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── contexts/      # React contexts
│       ├── services/      # API services
│       ├── utils/         # Utility functions
│       └── App.js         # Main App component
├── package.json           # Root dependencies
└── README.md             # Project documentation
```

## Next Steps

1. **User Interface Implementation**: Login and register components need to be implemented based on user-provided designs
2. **Additional Features**: Dashboard enhancements, user management, etc.
3. **Production Deployment**: Environment setup for production

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL is running
- Check database credentials in .env
- Verify Node.js version compatibility

### Frontend Issues  
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
- Check for port conflicts (3000 for frontend, 5000 for backend)

### Connection Issues
- Ensure both servers are running on correct ports
- Check firewall settings
- Verify CORS configuration in backend 