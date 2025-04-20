import { useState, useEffect } from 'react'
import { chatService } from '../services/api'
import socketService from '../services/socketService'

const ChatSidebar = ({ selectedChat, setSelectedChat, userId, setError }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch conversations
  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Try to get conversations from API
        let conversations = [];
        try {
          conversations = await chatService.getConversations();
        } catch (error) {
          console.error('Error fetching conversations:', error);
          setError?.("Failed to load conversations");
          
          // Fall back to mock data for now
          conversations = [
            {
              id: '1',
              userId: '67d5cc40b8a286d5caa3ca71',
              name: 'John Smith',
              lastMessage: 'Hey, is the textbook still available?',
              timestamp: new Date(),
              productId: '65f4567890abcdef12345678',
              productName: 'Calculus Textbook',
              unread: 2
            },
            {
              id: '2',
              userId: '67d5cc50b8a286d5caa3ca72',
              name: 'Sarah Johnson',
              lastMessage: 'Thanks for the calculator!',
              timestamp: new Date(Date.now() - 3600000),
              productId: '65f4567890abcdef12345679',
              productName: 'Scientific Calculator',
              unread: 0
            },
            {
              id: '3',
              userId: '67d5cc60b8a286d5caa3ca73',
              name: 'Ahmed Mohamed',
              lastMessage: 'Can we meet tomorrow at the library?',
              timestamp: new Date(Date.now() - 86400000),
              productId: '65f4567890abcdef1234567a',
              productName: 'Engineering Notes',
              unread: 0
            }
          ];
        }
        
        setChats(conversations);
      } catch (error) {
        console.error('Error in fetchChats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
  }, [userId, setError]);
  
  // Listen for new messages
  useEffect(() => {
    socketService.onMessageReceived((message) => {
      setChats(prevChats => {
        // Find the chat this message belongs to
        const chatIndex = prevChats.findIndex(chat => 
          chat.productId === message.productId && 
          (chat.userId === message.sender || chat.userId === message.receiver)
        );
        
        if (chatIndex !== -1) {
          // Update existing chat
          const updatedChats = [...prevChats];
          const chat = {...updatedChats[chatIndex]};
          
          // Update last message
          chat.lastMessage = message.text;
          chat.timestamp = new Date(message.createdAt || Date.now());
          
          // Update unread count if message is for current user and not from them
          // and if this isn't the currently selected chat
          if (message.sender !== userId && 
              (!selectedChat || selectedChat.id !== chat.id)) {
            chat.unread = (chat.unread || 0) + 1;
          }
          
          // Move this chat to the top
          updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chat);
          
          return updatedChats;
        } else {
          // This is a new conversation, we'd need more info to create a full chat item
          // Would need to make an API call to get user details
          return prevChats;
        }
      });
    });
  }, [userId, selectedChat]);
  
  // Reset unread counter when a chat is selected
  useEffect(() => {
    if (selectedChat && userId) {
      // Join the chat room
      socketService.joinChat(
        userId,
        selectedChat.userId,
        selectedChat.productId
      );
      
      // Reset unread count
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === selectedChat.id) {
            return { ...chat, unread: 0 };
          }
          return chat;
        });
      });
    }
  }, [selectedChat, userId]);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show time
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString();
  };

  if (loading) return (
    <div className="p-3 text-center">
      <div className="spinner-border spinner-border-sm text-primary" role="status">
        <span className="visually-hidden">Loading chats...</span>
      </div>
      <p className="mt-2">Loading conversations...</p>
    </div>
  );

  return (
    <div className="chat-sidebar border-end">
      <div className="p-3 border-bottom bg-light">
        <h5 className="mb-0">Messages</h5>
      </div>
      
      <div className="chat-list overflow-auto" style={{ height: 'calc(100vh - 170px)' }}>
        {chats.length === 0 ? (
          <div className="text-center text-muted p-4">
            <p>No conversations yet</p>
            <small>
              Browse products and message sellers to start chatting
            </small>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`d-flex align-items-start p-3 border-bottom position-relative 
                ${selectedChat?.id === chat.id ? 'bg-light' : ''}
                ${chat.unread > 0 ? 'fw-bold' : ''}
              `}
              onClick={() => setSelectedChat(chat)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar me-3 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                {chat.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-grow-1 min-width-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-truncate">{chat.name}</h6>
                  <small className="text-muted ms-2">{formatTime(chat.timestamp)}</small>
                </div>
                {chat.productName && (
                  <div className="small text-muted text-truncate mb-1">
                    Re: {chat.productName}
                  </div>
                )}
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
  );
};

export default ChatSidebar;
