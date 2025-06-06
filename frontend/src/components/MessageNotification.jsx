import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MessageNotification = ({ userId }) => {
  const [notification, setNotification] = useState(null)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // We'll handle notifications in the Chat component instead
    return () => {
      // Cleanup if needed
    }
  }, [userId])
  
  const handleClick = () => {
    // Navigate to chat page
    navigate('/chat')
    setVisible(false)
  }
  
  if (!visible || !notification) return null
  
  return (
    <div 
      className="toast show position-fixed" 
      style={{ top: '80px', right: '20px', zIndex: 1050 }}
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div className="toast-header">
        <strong className="me-auto">New Message</strong>
        <small>Just now</small>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setVisible(false)}
          aria-label="Close"
        ></button>
      </div>
      <div className="toast-body" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div><strong>From:</strong> User {notification.sender.substring(0, 6)}...</div>
        <div className="text-truncate">{notification.text}</div>
        <div className="mt-2 small text-muted">Click to view</div>
      </div>
    </div>
  )
}

export default MessageNotification
