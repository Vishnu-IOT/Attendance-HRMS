import React, { useState, useEffect } from 'react';
import '../styles/RaiseTicket.css';
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Completing Tasks.json';
import { IoAdd } from 'react-icons/io5';
import { createPortal } from 'react-dom';

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    desc: '',
  });

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = now.getFullYear();

  const [dateFilter, setDateFilter] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const [raiseTicket, setRaiseTicket] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthOptions = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // FORMAT TIME
  const formatTime = (timeString) => {
    if (!timeString || timeString === '00:00:00') return '--';

    const [hour, minute] = timeString.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    return `${h}:${minute} ${ampm}`;
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // GET USER INITIALS
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.substring(0, 2).toUpperCase();
  };

  // FORMAT WORKED HOURS
  const formatDuration = (timeString) => {
    if (!timeString || timeString === '00:00:00') return '--';

    const [hours, minutes] = timeString.split(':').map(Number);

    if (hours === 0 && minutes === 0) return '--';

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  };

  /* ================= FETCH NOTIFICATION ================= */

  useEffect(() => {
    const fetchRaiseTicket = async () => {
      try {
        const response = await fetch(
          `https://hrms.mpdatahub.com/api/tickets?month=${dateFilter.month}&year=${dateFilter.year}`
        );
        const result = await response.json();
        if (result.success) {
          setRaiseTicket(result.data);
        }
      } catch (error) {
        console.error('Error fetching Raise Ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaiseTicket();
  }, [activeForm, deleteId, dateFilter]);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDate = (e) => {
    const { name, value } = e.target;

    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= NOTIFICATION FORM SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(
        'https://hrms.mpdatahub.com/api/notification/create',
        {
          method: 'POST',
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Notification Created successfully!');

        setFormData({
          title: '',
          type: '',
          desc: '',
        });
      } else {
        alert(
          'Failed to create Notification: ' +
            (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  /* ================= NOTIFICATION DELETE ================= */

  const handleDelete = async (e) => {
    e.preventDefault();
    console.log(deleteId);
    const submitData = new FormData();
    submitData.append('id', deleteId);

    try {
      const response = await fetch(
        `https://hrms.mpdatahub.com/api/delete-Holiday/${deleteId}`
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Notification Deleted successfully!');
      } else {
        alert(
          'Failed to Delete Notification: ' +
            (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error deleting notifcation:', error);
      alert('Error deleting notification');
    } finally {
      setDeleteId(null);
    }
  };

  /* ================= NOTIFICATION ================= */

  const handleNotification = async (e) => {
    e.preventDefault();
    console.log(notificationId);
    const submitData = new FormData();
    submitData.append('id', notificationId);

    try {
      const response = await fetch(
        `https://hrms.mpdatahub.com/api/notification/send`,
        {
          method: 'POST',
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Notification Send successfully!');
      } else {
        alert(
          'Failed to Send Notification: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error in sending notification:', error);
      alert('Error sending notificaiton');
    } finally {
      setNotificationId(null);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="attendance-page loading-container">
        <div className="loader-pulse"></div>
        <p>Loading Tickets records...</p>
      </div>
    );
  }

  return (
    <div className="form-containers fade-in-up">
      {/* HEADER */}
      <div className="page-headers glass-panels">
        <div className="header-content">
          <div className="permission-title-group">
            <Lottie options={defaultOptions} height={70} width={70} />
            <div>
              <h1>Ticket Records</h1>
              <p>
                Easily raise tickets and monitor their progress to keep
                everything running smoothly.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="stat-badge">
              <span className="badge-label">Monthly Records</span>
              <span className="badge-value">{raiseTicket.length}</span>
            </div>
          </div>

        </div>
      </div>

      <div className="toggle-button">
        <button
          className="toggle-btn"
          onClick={() => setActiveForm((prev) => !prev)}
        >
          <IoAdd style={{ fontSize: '15px' }} /> Add Ticket
        </button>
      </div>

      <div style={{ display: 'flex', width: '100%', gap: '30px' }}>
        <div className="form-group">
          <label>Month Filter</label>
          <select name="month" value={dateFilter.month} onChange={handleDate}>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Year Filter</label>
          <select name="year" value={dateFilter.year} onChange={handleDate}>
            {[2026, 2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeForm &&
        createPortal(
          <div className="modal-overlays" onClick={() => setActiveForm(false)}>
            <div
              className="form-card modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-btn"
                onClick={() => setActiveForm(false)}
              >
                ×
              </button>
              <h2 className="form-title">Raise Ticket</h2>

              <form onSubmit={handleSubmit} className="registration-form">
                {/* TITLE */}

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SCHEDULED DATE */}

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="form-group full-width">
                  <label>Description</label>

                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* SUBMIT */}

                <div className="form-actions full-width">
                  <button type="submit" className="submit-btn">
                    {' '}
                    Add Ticket{' '}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <h2 className="form-title">Raised Ticket History</h2>
      {/* TABLE */}
      <div className="attendance-contents glass-panel">
        <div className="table-responsive">
          <table className="elegant-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Worked Hours</th>
              </tr>
            </thead>

            <tbody>
              {raiseTicket.length > 0 ? (
                raiseTicket.map((record) => (
                  <tr key={record.id} className="table-row">
                    {/* EMPLOYEE */}
                    <td>
                      <div className="employee-cell">
                        <div className="avatar-circle">
                          {getInitials(record.user.name)}
                        </div>

                        <span className="employee-name">
                          {record.user.name}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td>{formatDate(record.date)}</td>

                    {/* CHECK IN */}
                    <td>
                      <div className="time-badge in">
                        {record.type === 'clock_in'
                          ? formatTime(record.time)
                          : '--'}
                      </div>
                    </td>

                    {/* CHECK OUT */}
                    <td>
                      <div className="time-badge out">
                        {record.type === 'clock_out'
                          ? formatTime(record.time)
                          : '--'}
                      </div>
                    </td>

                    {/* DATE */}
                    <td>{record.reason}</td>

                    {/* STATUS */}
                    <td>
                      <div className="status-flex">
                        <span
                          className={`status-pill ${
                            record.type?.toLowerCase() === 'present'
                              ? 'present'
                              : 'absent'
                          }`}
                        >
                          {record.status || 'N/A'}
                        </span>

                        {record.late_checkin === 1 && (
                          <span
                            className="late-indicator"
                            title={`Late by ${record.late_checkin_time}`}
                          >
                            Late
                          </span>
                        )}
                      </div>
                    </td>

                    {/* WORKED HOURS */}
                    <td>
                      <span className="hours-text">
                        {formatDuration(record.time)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No Ticket records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId &&
        createPortal(
          <div className="modal-overlays" onClick={() => setDeleteId(null)}>
            <div
              className="form-card modal confirm-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setDeleteId(null)}>
                ×
              </button>

              <h2 className="form-title">Delete Notification</h2>

              <p className="confirm-text">
                Are you sure you want to delete this Notification?
              </p>

              <div className="confirm-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {notificationId &&
        createPortal(
          <div
            className="modal-overlays"
            onClick={() => setNotificationId(null)}
          >
            <div
              className="form-card modal confirm-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-btn"
                onClick={() => setNotificationId(null)}
              >
                ×
              </button>

              <h2 className="form-title">Send Notification</h2>

              <p className="confirm-text">
                Are you sure you want to send notification?
              </p>

              <div className="confirm-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setNotificationId(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  style={{ background: '#5355E0' }}
                  onClick={handleNotification}
                >
                  Send
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default RaiseTicket;
