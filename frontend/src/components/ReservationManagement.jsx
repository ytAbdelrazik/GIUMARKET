import React, { useState, useEffect } from 'react';
import { reservationApi } from '../services/api';

const ReservationManagement = ({ user, isSeller = false }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

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

  const handleMarkAsSold = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowSoldModal(true);
  };

  const confirmMarkAsSold = async () => {
    try {
      setLoading(true);
      await reservationApi.markAsSold(selectedReservationId);
      setShowSoldModal(false);
      setSelectedReservationId(null);
      await fetchReservations();
    } catch (err) {
      setError('Failed to mark as sold');
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
                    {isSeller && reservation.status === 'accepted' && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleMarkAsSold(reservation._id)}
                        disabled={loading}
                      >
                        Mark as Sold
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal for confirmation */}
      {showSoldModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Mark as Sold</h5>
                <button type="button" className="btn-close" onClick={() => setShowSoldModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to mark this product as sold?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSoldModal(false)}>Cancel</button>
                <button className="btn btn-warning" onClick={confirmMarkAsSold} disabled={loading}>
                  Yes, Mark as Sold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement; 