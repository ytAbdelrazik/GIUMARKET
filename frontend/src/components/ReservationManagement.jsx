import React, { useState, useEffect } from 'react';
import { reservationApi } from '../services/api';

const ReservationManagement = ({ user, isSeller = false }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [user, isSeller]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = isSeller
        ? await reservationApi.getSellerReservations()
        : await reservationApi.getBuyerReservations();
      setReservations(response.data);
    } catch (err) {
      setError('Failed to load reservations');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reservationId, action) => {
    try {
      setLoading(true);
      switch (action) {
        case 'accept':
          await reservationApi.acceptReservation(reservationId);
          break;
        case 'reject':
          await reservationApi.rejectReservation(reservationId);
          break;
        case 'cancel':
          await reservationApi.cancelReservation(reservationId);
          break;
        default:
          throw new Error('Invalid action');
      }
      // Refresh reservations after action
      await fetchReservations();
    } catch (err) {
      setError(`Failed to ${action} reservation`);
      console.error(`Error ${action}ing reservation:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">
          {isSeller ? 'Reservation Requests' : 'My Reservations'}
        </h5>
        
        {reservations.length === 0 ? (
          <p className="text-muted">No reservations found</p>
        ) : (
          <div className="list-group">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{reservation.product?.name || "Unknown Product"}</h6>
                    <p className="mb-1">
                      {isSeller
                        ? `Requested by: ${reservation.buyer?.name || "Unknown"}`
                        : `Seller: ${reservation.seller?.name || "Unknown"}`}
                    </p>
                    <small className="text-muted">
                      Status: {reservation.status}
                    </small>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {isSeller && reservation.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAction(reservation._id, 'accept')}
                          disabled={loading}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(reservation._id, 'reject')}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {!isSeller && reservation.status === 'pending' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction(reservation._id, 'cancel')}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement; 