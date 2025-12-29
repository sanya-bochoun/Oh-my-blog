import './App.css'
import './index.css'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'
import HeroSection from './components/HeroSection'

function App() {

  return (
    <AuthProvider>
      <Navbar />
      <HeroSection />
      <Toaster />
    </AuthProvider>
  )
}

export default App
