import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Debug: Track localStorage changes
const originalRemoveItem = localStorage.removeItem.bind(localStorage)
localStorage.removeItem = function(key) {
  if (key === 'access_token' || key === 'refresh_token') {
    console.log(`[localStorage] removeItem('${key}') called`)
    console.trace() // This will show the call stack
  }
  return originalRemoveItem(key)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A24',
            color: '#fff',
            border: '1px solid #2E2E3A'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
