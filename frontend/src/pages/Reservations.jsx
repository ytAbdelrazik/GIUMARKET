import React, { useState } from 'react';
import ReservationManagement from '../components/ReservationManagement';

const Reservations = ({ user }) => {
  const [tab, setTab] = useState('buyer');
  console.log('User:', user);
  return (
    <div className="container my-5">
      <h2 className="mb-4">My Reservations</h2>
      <p className="mb-4 text-muted">
        Here you can manage all your reservations as a buyer or seller. Switch tabs to see requests for your products or reservations you have made.
      </p>
      <div className="mb-4">
        <button
          className={`btn ${tab === 'buyer' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setTab('buyer')}
        >
          As Buyer
        </button>
        <button
          className={`btn ${tab === 'seller' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setTab('seller')}
        >
          As Seller
        </button>
      </div>
      {/* ReservationManagement just renders the list */}
      <ReservationManagement user={user} isSeller={tab === 'seller'} />
    </div>
  );
};

export default Reservations;