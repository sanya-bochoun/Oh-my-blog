# Oh!myBlog

A modern, full-stack personal blog application built with React and Node.js, featuring real-time notifications, article management, user authentication, and more.

## 🚀 Features

### Core Features
- **Article Management**: Create, edit, delete, and publish blog articles
- **User Authentication**: Secure registration, login, and password reset
- **Real-time Notifications**: Socket.IO powered notifications for new articles, comments, and likes
- **Comment System**: Users can comment on articles with nested comment support
- **Like System**: Like articles and comments
- **Category Management**: Organize articles by categories
- **User Profiles**: Customizable user profiles with avatar upload
- **Admin Panel**: Comprehensive admin dashboard for content and user management
- **Search Functionality**: Real-time search across articles
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Image upload with Cloudinary integration
- **Rate Limiting**: API rate limiting for security
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Error Handling**: Comprehensive error handling and validation
- **Database Migrations**: SQL migration scripts for database setup

## 📁 Project Structure

```
ohmyblog/
├── backend/                 # Backend API server
│   ├── config/             # Configuration files (Cloudinary, Email)
│   ├── controllers/        # Request handlers
│   │   ├── admin/         # Admin-specific controllers
│   │   └── ...            # Other controllers
│   ├── docs/              # API documentation
│   ├── middleware/        # Express middleware
│   ├── migrations/        # Database migration scripts
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── server.mjs         # Main server file
│   └── package.json       # Backend dependencies
│
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── ui/       # UI components
│   │   ├── pages/        # Page components
│   │   │   └── admin/    # Admin pages
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service functions
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── package.json       # Frontend dependencies
│
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Cloudinary** for image storage
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Helmet** for security
- **Rate Limiting** for API protection

### Frontend
- **React 19** with Vite
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Socket.IO Client** for real-time updates
- **React Markdown** for markdown rendering
- **Sonner** for toast notifications
- **React Icons** for icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Git**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ohmyblog
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret

# Server
NODE_ENV=development
PORT=5000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Run database migrations:

```bash
npm run migrate
```

Start the backend server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗄️ Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. Run the migration scripts in order:
   - `migrations/01_create_tables.sql`
   - `migrations/02_create_blog_tables.sql`
   - `migrations/03_add_reset_password_columns.sql`
   - `migrations/notifications.sql`
   - Other migration files as needed

Or use the migration script:

```bash
cd backend
npm run migrate
```

## 🚀 Usage

### Development

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

The API documentation is available in the `backend/docs/` directory:
- `API.md` - Complete API reference
- `api_endpoints.md` - Endpoint documentation
- `database_design.md` - Database schema
- `setup_guide.md` - Setup instructions

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/detail/:slug` - Get article by slug
- `POST /api/articles` - Create new article (authenticated)
- `PUT /api/articles/:id` - Update article (authenticated)
- `DELETE /api/articles/:id` - Delete article (authenticated)

#### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create comment (authenticated)
- `PUT /api/comments/:id` - Update comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

#### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)
- `DELETE /api/notifications/:id` - Delete notification (authenticated)
- `DELETE /api/notifications/all` - Delete all notifications (authenticated)

#### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `POST /api/users/avatar` - Upload avatar (authenticated)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. After login, you'll receive:
- `accessToken` - Short-lived token (stored in localStorage)
- `refreshToken` - Long-lived token (stored in localStorage)

Include the access token in API requests:
```
Authorization: Bearer <accessToken>
```

## 👥 User Roles

- **User**: Can create articles, comment, like, and manage their own content
- **Admin**: Full access to all features including user management and content moderation

## 🎨 Features in Detail

### Real-time Notifications
- Notifications are sent via Socket.IO when:
  - New articles are published
  - Comments are added to your articles
  - Your articles/comments receive likes
- Notifications appear in real-time without page refresh

### Article Management
- Rich text editor for article content
- Markdown support
- Image upload with Cloudinary
- Category assignment
- Draft/Published status
- SEO-friendly slugs

### Admin Panel
- User management (view, lock/unlock users)
- Article management (CRUD operations)
- Category management
- Notification management
- Password reset for users

## 🧪 Testing

Run tests (if available):

```bash
cd backend
npm test
```

## 📝 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CLOUDINARY_*` - Cloudinary credentials
- `EMAIL_*` - Email service credentials

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Check CORS configuration in `backend/server.mjs`
   - Verify frontend URL is in allowed origins

3. **Image Upload Fails**
   - Verify Cloudinary credentials
   - Check file size limits (default: 5MB)
   - Ensure file type is allowed (jpg, png, gif)

4. **Authentication Issues**
   - Clear localStorage and login again
   - Check JWT_SECRET is set correctly
   - Verify token expiration settings

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Development

### Code Structure

- **Backend**: Follows MVC pattern with separate controllers, models, and routes
- **Frontend**: Component-based architecture with hooks and context for state management

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- All open-source contributors whose packages made this project possible

---

**Built with ❤️ using React and Node.js**

