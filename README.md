# Wateen Watify

A full-stack web application built with React frontend, Node.js/Express backend, and PostgreSQL database.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **PostgreSQL** database with **pg** driver
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** and **Helmet** for security
- **Jest** and **Supertest** for testing

### Frontend
- **React** (to be set up)

## 📁 Project Structure

```
wateen_watify/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/           # React frontend (to be set up)
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── .gitignore         # Git ignore file
└── README.md          # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### 1. Clone and Install Dependencies
```bash
# Dependencies are already installed, but if needed:
npm install
```

### 2. Database Setup
1. Create a PostgreSQL database named `wateen_watify`
2. Update the database credentials in `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wateen_watify
DB_USER=your_username
DB_PASSWORD=your_password
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/wateen_watify
```

### 3. Environment Variables
Update the `.env` file with your configuration:
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (IMPORTANT: Change this to a secure secret)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Start the Development Server
```bash
# Start backend server with auto-reload
npm run dev

# Or start without auto-reload
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |

### Example API Usage

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📜 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run client` - Start React frontend (when set up)
- `npm run server` - Alias for `npm run dev`
- `npm run build` - Build React frontend (when set up)

## 🔐 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs with salt rounds
- **CORS Protection** configured for frontend URL
- **Helmet** for security headers
- **Input Validation** on all endpoints
- **SQL Injection Protection** using parameterized queries

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚧 Next Steps

1. **Set up React Frontend**:
   ```bash
   cd frontend
   npx create-react-app . --template typescript  # or without typescript
   ```

2. **Add More Features**:
   - User roles and permissions
   - Password reset functionality
   - Email verification
   - File upload capabilities
   - Admin panel

3. **Production Deployment**:
   - Set up environment variables for production
   - Configure PostgreSQL for production
   - Set up CI/CD pipeline
   - Deploy to cloud platforms (Heroku, AWS, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Happy Coding! 🎉** 