import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const Chat = ({ user }) => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
        
        // If we have a receiverId, find the current conversation
        if (receiverId) {
          const conversation = response.data.find(conv => 
            conv.participants.some(p => p._id === receiverId)
          );
          setCurrentConversation(conversation);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      if (!currentConversation?._id) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/messages/${currentConversation._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort messages by createdAt timestamp
        const sortedMessages = response.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.response?.status === 404) {
          setMessages([]);
        } else {
          setError('Failed to load messages');
        }
      }
    };

    // Initial fetch
    fetchConversations();
    
    // Set up polling intervals
    const conversationsInterval = setInterval(fetchConversations, 5000);
    const messagesInterval = setInterval(fetchMessages, 3000);

    return () => {
      clearInterval(conversationsInterval);
      clearInterval(messagesInterval);
    };
  }, [user, receiverId, navigate, currentConversation?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId || !currentConversation) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!currentConversation.productId?._id) {
      setError('Product information not found');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        {
          text: newMessage.trim(),
          receiverId,
          productId: currentConversation.productId._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add the new message to the state and sort
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, response.data];
        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to send message');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <h4>Conversations</h4>
          <div className="list-group">
            {conversations.length === 0 ? (
              <div className="text-muted p-3">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv._id}
                  to={`/chat/${conv.participants.find((p) => p._id !== user.id)?._id}`}
                  className={`list-group-item list-group-item-action ${
                    conv.participants.find((p) => p._id === receiverId) ? 'active' : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {conv.participants.find((p) => p._id !== user.id)?.name || 'Unknown User'}
                    </div>
                    {conv.productId && (
                      <small className="text-muted">
                        {conv.productId.title} - ${conv.productId.price}
                      </small>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="col-md-8">
          {receiverId ? (
            <>
              <div
                className="chat-messages border rounded p-3 mb-3"
                style={{ height: '400px', overflowY: 'auto' }}
              >
                {messages.length === 0 ? (
                  <div className="text-center text-muted">
                    <p>No messages yet</p>
                    <p>Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId = typeof message.sender === 'object' && message.sender !== null
                      ? message.sender._id
                      : message.sender;
                    const isCurrentUser = String(senderId) === String(user.id);
                    return (
                      <div
                        key={message._id}
                        className={`message-container d-flex ${
                          isCurrentUser ? 'justify-content-end' : 'justify-content-start'
                        } mb-2`}
                      >
                        <div
                          className={`message p-3 rounded-3 ${
                            isCurrentUser 
                              ? 'bg-primary text-white' 
                              : 'bg-light text-dark'
                          }`}
                          style={{
                            maxWidth: '70%',
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <div className="message-text">{message.text}</div>
                          <div 
                            className={`message-time small ${
                              isCurrentUser ? 'text-white-50' : 'text-muted'
                            }`}
                            style={{ fontSize: '0.75rem', marginTop: '4px' }}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendMessage} className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-center mt-5">
              <h5>Select a conversation to start chatting</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
