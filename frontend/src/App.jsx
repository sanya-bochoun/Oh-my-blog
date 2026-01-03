import "./App.css"
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ArticleSection from './components/ArticleSection'
import Footer from './components/Footer'
import ArticleDetail from './pages/ArticleDetail'
import NotFound from './pages/NotFound'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import RegistrationSuccess from './pages/RegistrationSuccess'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordByToken from './pages/ResetPasswordByToken'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import BackToTopButton from './components/BackToTopButton'
import { useAuth } from './hooks/useAuth'
import ArticleManagement from './pages/ArticleManagement'
import AdminLayout from './pages/admin/AdminLayout'
import AdminArticleManagement from './pages/admin/ArticleManagement'
import AdminCreateArticle from './pages/admin/CreateArticle'
import CategoryManagement from './pages/admin/CategoryManagement'
import CreateCategory from './pages/admin/CreateCategory'
import EditCategory from './pages/admin/EditCategory'
import AdminProfile from './pages/admin/AdminProfile'
import Notification from './pages/admin/Notification'
import AdminResetPassword from './pages/admin/ResetPassword'
import UserManagement from './pages/admin/UserManagement'
import AdminResetUserPassword from './pages/admin/AdminResetUserPassword'
import CreateArticle from './pages/CreateArticle'
import AdminEditArticle from './pages/admin/EditArticle'
import EditArticle from './pages/EditArticle'
import ErrorBoundary from './components/ErrorBoundary'
import ContactMe from './pages/ContactMe'
import AboutMe from './pages/AboutMe'

// สร้าง Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// สร้าง Layout Component
const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <BackToTopButton />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="article-management" element={<AdminArticleManagement />} />
            <Route path="create-article" element={<AdminCreateArticle />} />
            <Route path="edit-article/:id" element={<AdminEditArticle />} />
            <Route path="category-management" element={<CategoryManagement />} />
            <Route path="create-category" element={<CreateCategory />} />
            <Route path="edit-category/:id" element={<EditCategory />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notification" element={<Notification />} />
            <Route path="reset-password" element={<AdminResetPassword />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="reset-user-password/:userId" element={<AdminResetUserPassword />} />
            {/* Other admin routes will be added here */}
          </Route>

          {/* Main Website Routes */}
          <Route path="/" element={<MainLayout><><HeroSection /><ArticleSection /></></MainLayout>} />
          <Route path="/article/:slug" element={<MainLayout><ArticleDetail /></MainLayout>} />
          <Route path="/signup" element={<MainLayout><SignUp /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
          <Route path="/reset-password/:token" element={<MainLayout><ResetPasswordByToken /></MainLayout>} />
          <Route path="/verify-email/:token" element={<MainLayout><VerifyEmail /></MainLayout>} />
          <Route path="/registration-success" element={<MainLayout><RegistrationSuccess /></MainLayout>} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ProtectedRoute>
              <MainLayout><ResetPassword /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/article-management" element={
            <ProtectedRoute>
              <MainLayout><ArticleManagement /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/create-article" element={
            <ErrorBoundary>
              <ProtectedRoute>
                <MainLayout><CreateArticle /></MainLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/admin/category-management" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
          <Route path="/admin/create-category" element={<ProtectedRoute><CreateCategory /></ProtectedRoute>} />
          <Route path="/admin/edit-category/:id" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
          <Route path="/edit-article/:id" element={<ProtectedRoute><EditArticle /></ProtectedRoute>} />
          <Route path="/contact" element={<MainLayout><ContactMe /></MainLayout>} />
          <Route path="/about" element={<MainLayout><AboutMe /></MainLayout>} />
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
