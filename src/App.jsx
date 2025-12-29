import './App.css'
import './index.css'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'

function App() {

  return (
    <AuthProvider>
      <Navbar />
      <Toaster />
    </AuthProvider>
  )
}

export default App
