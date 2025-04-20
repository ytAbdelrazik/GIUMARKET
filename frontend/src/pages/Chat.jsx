import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ChatSidebar from '../components/ChatSidebar'
import { chatService } from '../services/api'
import socketService from '../services/socketService'

const Chat = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const location = useLocation()
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    socketService.onConnect(() => {
      console.log("Socket connected in Chat component");
      setSocketConnected(true);
    });
    
    socketService.onDisconnect(() => {
      setSocketConnected(false);
    });
    
    socketService.onConnectionFailed((err) => {
      setError("Failed to connect to chat server. Please try refreshing.");
    });
    
    return () => {
      // We don't disconnect here because other components might need the socket
    };
  }, []);
  
  // Check for direct chat from product details
  useEffect(() => {
    const checkDirectChat = async () => {
      const productChatInfo = localStorage.getItem('currentProductChat');
      if (productChatInfo) {
        try {
          const { productId, sellerId, productName } = JSON.parse(productChatInfo);
          
          // Only proceed if we're not already in this chat
          if (!selectedChat || selectedChat.productId !== productId || selectedChat.userId !== sellerId) {
            setLoading(true);
            
            // Get seller details
            const sellerData = await chatService.getUserById(sellerId);
            
            if (sellerData) {
              const directChat = {
                id: `direct_${productId}_${sellerId}`,
                userId: sellerId,
                name: sellerData.name || 'Seller',
                productId: productId,
                productName: productName,
                timestamp: new Date(),
                unread: 0
              };
              
              setSelectedChat(directChat);
              
              // Join chat room
              socketService.joinChat(user.id, sellerId, productId);
              
              // Remove from localStorage after processing
              localStorage.removeItem('currentProductChat');
            }
          }
        } catch (err) {
          console.error('Error processing direct chat:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (user && user.id) {
      checkDirectChat();
    }
  }, [user, location]);
  
  // Listen for incoming messages
  useEffect(() => {
    const handleMessageReceived = (message) => {
      console.log("Message received in Chat component:", message);
      
      // If message is for the current chat, add it to messages
      if (selectedChat && 
          message.productId === selectedChat.productId &&
          (message.sender === user.id || message.sender === selectedChat.userId)) {
        
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(msg => 
            msg._id === message._id || 
            (msg.tempId && msg.tempId === message.tempId)
          );
          
          if (!exists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
        
        // Mark message as read if not from current user
        if (message.sender !== user.id) {
          socketService.markAsRead(message._id);
        }
      }
    };
    
    socketService.onMessageReceived(handleMessageReceived);
    
    return () => {
      // We don't need to clean up the onMessageReceived since it's a singleton
    };
  }, [selectedChat, user?.id]);
  
  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat && user?.id) {
      setLoading(true);
      
      const fetchMessages = async () => {
        try {
          const fetchedMessages = await chatService.getMessages(
            user.id,
            selectedChat.userId,
            selectedChat.productId
          );
          
          setMessages(fetchedMessages || []);
          
          // Join the chat room for real-time updates
          socketService.joinChat(
            user.id,
            selectedChat.userId,
            selectedChat.productId
          );
          
          // Mark unread messages as read
          if (fetchedMessages && fetchedMessages.length > 0) {
            fetchedMessages
              .filter(msg => !msg.read && msg.sender !== user.id)
              .forEach(msg => socketService.markAsRead(msg._id));
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError("Failed to load messages. Please try again.");
          
          // Keep empty array instead of fallback mock data in production
          setMessages([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedChat, user?.id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user?.id) return;
    
    // Create a temp ID for optimistic updates
    const tempId = `temp_${Date.now()}`;
    
    // Create temporary message for UI
    const tempMessage = {
      _id: tempId,
      tempId,
      sender: user.id,
      text: newMessage,
      productId: selectedChat.productId,
      createdAt: new Date(),
      read: false
    };
    
    // Add to UI immediately
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setNewMessage('');
    
    // Send through socket with HTTP fallback
    const sent = socketService.sendMessage(
      user.id,
      selectedChat.userId,
      newMessage,
      selectedChat.productId
    );
    
    // If socket send failed, the socketService will handle HTTP fallback automatically
    if (!sent) {
      // Only show a notification - persistence is already handled in socketService
      console.log("Using HTTP fallback for message delivery");
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="row g-0" style={{ height: 'calc(100vh - 70px)' }}>
        <div className="col-md-4 col-lg-3 border-end">
          <ChatSidebar 
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            userId={user?.id}
            setError={setError}
          />
        </div>
        
        <div className="col-md-8 col-lg-9 d-flex flex-column">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show m-2" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="alert" 
                aria-label="Close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}
          
          {!selectedChat ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-chat-text text-muted" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <p className="text-muted">Select a conversation to start chatting</p>
              {!socketConnected && (
                <div className="alert alert-warning mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Not connected to chat server. Trying to reconnect...
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="chat-header p-3 border-bottom bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{selectedChat.name}</h5>
                  {selectedChat.productName && (
                    <span className="badge bg-light text-dark border">
                      Re: {selectedChat.productName}
                    </span>
                  )}
                </div>
                {!socketConnected && (
                  <div className="text-warning small mt-1">
                    <i className="bi bi-wifi-off me-1"></i>
                    Offline - Messages will still be delivered
                  </div>
                )}
              </div>
              
              <div className="messages-container flex-grow-1 p-3 overflow-auto bg-light" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {loading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center my-4 text-muted">
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSentByMe = message.sender === user.id;
                    // For temporarily added messages, we use CSS to indicate pending status
                    const isPending = message.tempId && !message._id;
                    
                    return (
                      <div 
                        key={message._id || message.tempId} 
                        className={`d-flex mb-3 ${isSentByMe ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div 
                          className={`message p-3 rounded-3 ${isSentByMe 
                            ? `bg-primary text-white ${isPending ? 'opacity-60' : ''}` 
                            : 'bg-white border'}`}
                          style={{ maxWidth: '75%' }}
                        >
                          <p className="mb-0">{message.text}</p>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <small className={isSentByMe ? 'text-white-50' : 'text-muted'}>
                              {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </small>
                            {isPending && isSentByMe && (
                              <small className="ms-2 text-white-50">
                                <i className="bi bi-clock"></i>
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="message-form p-3 border-top" onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !newMessage.trim()}
                  >
                    Send
                  </button>
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
