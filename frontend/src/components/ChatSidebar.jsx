import { useState, useEffect } from 'react'

const ChatSidebar = ({ selectedChat, setSelectedChat, userId }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Here you would fetch the user's chats from the backend
    // For now, we'll use mock data
    const fetchChats = async () => {
      try {
        // Mock data - in a real app, this would come from your API
        const mockChats = [
          {
            id: '1',
            name: 'John Smith',
            lastMessage: 'Hey, is the textbook still available?',
            timestamp: new Date(),
            unread: 2
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            lastMessage: 'Thanks for the calculator!',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            unread: 0
          },
          {
            id: '3',
            name: 'Ahmed Mohamed',
            lastMessage: 'Can we meet tomorrow at the library?',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            unread: 0
          }
        ]
        
        setChats(mockChats)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching chats:', error)
        setLoading(false)
      }
    }
    
    fetchChats()
  }, [userId])
  
  const formatTime = (timestamp) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    
    // If today, show time
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' })
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString()
  }

  if (loading) return (
    <div className="p-3 text-center">
      <div className="spinner-border spinner-border-sm text-primary" role="status">
        <span className="visually-hidden">Loading chats...</span>
      </div>
      <p className="mt-2">Loading chats...</p>
    </div>
  )

  return (
    <div className="chat-sidebar border-end">
      <div className="p-3 border-bottom bg-light">
        <h5 className="mb-0">Messages</h5>
      </div>
      
      <div className="chat-list overflow-auto" style={{ height: 'calc(100vh - 170px)' }}>
        {chats.length === 0 ? (
          <div className="text-center text-muted p-4">No conversations yet</div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`d-flex align-items-start p-3 border-bottom position-relative ${selectedChat?.id === chat.id ? 'bg-light' : ''}`}
              onClick={() => setSelectedChat(chat)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar me-3 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                {chat.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-truncate">{chat.name}</h6>
                  <small className="text-muted ms-2">{formatTime(chat.timestamp)}</small>
                </div>
                <p className="mb-0 text-truncate text-muted small">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger mt-3 me-2">
                  {chat.unread}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatSidebar
