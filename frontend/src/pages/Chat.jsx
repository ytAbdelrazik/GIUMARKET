import { useState, useEffect } from 'react'
import ChatSidebar from '../components/ChatSidebar'

const Chat = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  
  useEffect(() => {
    // Here you would fetch messages when a chat is selected
    if (selectedChat) {
      // Fetch messages for the selected chat
      // This is a placeholder as the backend doesn't have chat functionality yet
      setMessages([
        { id: 1, sender: 'other-user', content: 'Hello, I am interested in your product', timestamp: new Date() },
        { id: 2, sender: user.id, content: 'Great! When would you like to meet?', timestamp: new Date() }
      ])
    }
  }, [selectedChat, user])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    // Here you would send the message to the backend
    // For now, just add it to the local state
    const message = {
      id: Date.now(),
      sender: user.id,
      content: newMessage,
      timestamp: new Date()
    }
    
    setMessages([...messages, message])
    setNewMessage('')
  }

  return (
    <div className="container-fluid px-0">
      <div className="row g-0" style={{ height: 'calc(100vh - 70px)' }}>
        <div className="col-md-4 col-lg-3 border-end">
          <ChatSidebar 
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            userId={user.id}
          />
        </div>
        
        <div className="col-md-8 col-lg-9 d-flex flex-column">
          {!selectedChat ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-chat-text text-muted" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <p className="text-muted">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header p-3 border-bottom bg-light">
                <h5 className="mb-0">{selectedChat.name}</h5>
              </div>
              
              <div className="messages-container flex-grow-1 p-3 overflow-auto bg-light" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {messages.map(message => {
                  const isSentByMe = message.sender === user.id;
                  return (
                    <div 
                      key={message.id} 
                      className={`d-flex mb-3 ${isSentByMe ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div className={`message p-3 rounded-3 ${isSentByMe ? 'bg-primary text-white' : 'bg-white border'}`}
                           style={{ maxWidth: '75%' }}>
                        <p className="mb-0">{message.content}</p>
                        <small className={`d-block mt-1 ${isSentByMe ? 'text-white-50' : 'text-muted'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <form className="message-form p-3 border-top" onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
