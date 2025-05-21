import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const Chat = ({ user }) => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [productFromDetail, setProductFromDetail] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [otherUserReservations, setOtherUserReservations] = useState([]);

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
        setMessages(response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      }
    };

    const fetchReservation = async () => {
      if (!currentConversation?.productId?._id) return;

      try {
        const endpoint = currentConversation.productId.seller === user.id ? 'seller' : 'buyer';
        const response = await axios.get(`${API_BASE_URL}/reservations/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const reservation = response.data.find(res => 
          res.product._id === currentConversation.productId._id &&
          ((endpoint === 'seller' && res.buyer._id === receiverId) ||
           (endpoint === 'buyer' && res.seller._id === receiverId))
        );
        setCurrentReservation(reservation);
      } catch (error) {
        console.error('Error fetching reservation:', error);
      }
    };

    // Check if we came from product detail page
    const productId = location.state?.productId;
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/products/single/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProductFromDetail(response.data);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }

    const fetchOtherUserReservations = async () => {
      if (!currentConversation) return;

      try {
        // Get the other user's ID from the conversation participants
        const otherUserId = currentConversation.participants.find(p => p._id !== user.id)?._id;
        if (!otherUserId) return;

        // If current user is seller, get reservations made by the buyer (otherUserId)
        const endpoint = 'seller';
        const response = await axios.get(`${API_BASE_URL}/reservations/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Reservations response:', response.data);
        console.log('Current user ID:', user.id);
        console.log('Other user ID:', otherUserId);
        
        // Filter reservations to only show those where:
        // 1. Current user is the seller (user.id === reservation.seller)
        // 2. The other user in the conversation is the buyer
        const filteredReservations = response.data.filter(res => 
          res.seller === user.id && res.buyer._id === otherUserId
        );
        console.log('Filtered reservations:', filteredReservations);
        setOtherUserReservations(filteredReservations);
      } catch (error) {
        console.error('Error fetching other user reservations:', error);
      }
    };

    fetchConversations();
    fetchOtherUserReservations(); // Initial fetch
    const conversationsInterval = setInterval(fetchConversations, 5000);
    const messagesInterval = setInterval(fetchMessages, 3000);
    const reservationsInterval = setInterval(fetchOtherUserReservations, 5000); // Regular updates

    return () => {
      clearInterval(conversationsInterval);
      clearInterval(messagesInterval);
      clearInterval(reservationsInterval);
    };
  }, [user, receiverId, navigate, currentConversation?._id, location.state]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId || !currentConversation) return;

    const token = localStorage.getItem('token');
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

      setMessages(prev => [...prev, response.data].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      ));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleCreateReservation = async () => {
    if (!productFromDetail?._id) return;

    setReservationLoading(true);
    setError(null);
    setReservationSuccess(false);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reservations/request/${productFromDetail._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the current reservation state with the new reservation
      setCurrentReservation(response.data.reservation);
      setReservationSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError(error.response?.data?.message || 'Failed to create reservation');
      setReservationSuccess(false);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleReservationAction = async (action, reservationId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_BASE_URL}/reservations/${action}/${reservationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Refresh the reservations list after action
      const response = await axios.get(`${API_BASE_URL}/reservations/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredReservations = response.data.filter(res => 
        res.buyer._id === receiverId
      );
      setOtherUserReservations(filteredReservations);
      setError(null);
    } catch (error) {
      console.error(`Error ${action}ing reservation:`, error);
      setError(`Failed to ${action} reservation`);
    }
  };

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <h4>Conversations</h4>
          <div className="list-group">
            {conversations.map((conv) => (
              <Link
                key={conv._id}
                to={`/chat/${conv.participants.find((p) => p._id !== user.id)?._id}`}
                className={`list-group-item list-group-item-action ${
                  conv.participants.find((p) => p._id === receiverId) ? 'active' : ''
                }`}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {conv.participants.find((p) => p._id !== user.id)?.name}
                  </div>
                  {conv.productId && (
                    <small className="text-muted">
                      {conv.productId.title}
                    </small>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="col-md-8">
          {receiverId ? (
            <>
              {error && (
                <div className="alert alert-danger mb-3">{error}</div>
              )}

              {/* Other User's Reservations (Seller's View) */}
              {otherUserReservations.length > 0 && (
                <div className="card mb-3">
                  <div className="card-header">
                    <h5 className="mb-0">Reservation Requests from {otherUserReservations[0].buyer.name}</h5>
                  </div>
                  <div className="card-body">
                    {otherUserReservations.map((reservation) => (
                      <div key={reservation._id} className="border-bottom mb-3 pb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{reservation.product.name}</h6>
                            <p className="mb-1">Price: ${reservation.product.price}</p>
                            <span className={`badge ${
                              reservation.status === 'pending' ? 'bg-warning' :
                              reservation.status === 'accepted' ? 'bg-success' :
                              'bg-danger'
                            }`}>
                              {reservation.status}
                            </span>
                            <small className="d-block text-muted">
                              Requested: {new Date(reservation.createdAt).toLocaleString()}
                            </small>
                          </div>
                          {reservation.status === 'pending' && user.id === reservation.seller && (
                            <div>
                              <button 
                                className="btn btn-success btn-sm me-2"
                                onClick={() => handleReservationAction('accept', reservation._id)}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReservationAction('reject', reservation._id)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservation UI */}
              {productFromDetail && productFromDetail.seller === receiverId && (
                <div className={`alert ${reservationSuccess ? 'alert-success' : 'alert-info'} mb-3`}>
                  {productFromDetail.seller === user.id ? (
                    // Seller's view
                    currentReservation?.status === 'pending' ? (
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Pending reservation request for {productFromDetail.name}</span>
                        <div>
                          <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleReservationAction('accept', currentReservation._id)}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReservationAction('reject', currentReservation._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span>No pending reservation for {productFromDetail.name}</span>
                    )
                  ) : (
                    // Buyer's view
                    !currentReservation ? (
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Would you like to reserve {productFromDetail.name} for ${productFromDetail.price}?</span>
                        <button
                          className={`btn ${reservationSuccess ? 'btn-success' : 'btn-primary'} btn-sm`}
                          onClick={handleCreateReservation}
                          disabled={reservationLoading}
                        >
                          {reservationLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Sending Request...
                            </>
                          ) : reservationSuccess ? (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Request Sent
                            </>
                          ) : (
                            'Request Reservation'
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          Your reservation is{' '}
                          <span className={`badge ${
                            currentReservation.status === 'pending' ? 'bg-warning' :
                            currentReservation.status === 'accepted' ? 'bg-success' :
                            'bg-danger'
                          }`}>
                            {currentReservation.status}
                          </span>
                        </span>
                        {currentReservation.status === 'pending' && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleReservationAction('cancel', currentReservation._id)}
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Chat messages */}
              <div className="chat-messages border rounded p-3 mb-3" style={{ height: '400px', overflowY: 'auto' }}>
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message-container d-flex ${
                      message.sender._id === user.id ? 'justify-content-end' : 'justify-content-start'
                    } mb-2`}
                  >
                    <div
                      className={`message p-3 rounded-3 ${
                        message.sender._id === user.id 
                          ? 'bg-primary text-white' 
                          : 'bg-light text-dark'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      <div className="message-text">{message.text}</div>
                      <div className="message-time small mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
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
