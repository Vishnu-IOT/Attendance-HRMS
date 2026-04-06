import React, { useState, useEffect } from 'react';
import '../styles/RaiseTicket.css';
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Completing Tasks.json';
import { IoAdd } from 'react-icons/io5';
import { createPortal } from 'react-dom';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    type: '',
    time: '',
    reason: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
  const [updatingId, setUpdatingId] = useState(null);

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

  const STATUS_CONFIG = {
    approved: {
      label: 'Approved',
      icon: <FiCheckCircle />,
      cls: 'status--approved',
    },
    pending: { label: 'Pending', icon: <FiClock />, cls: 'status--pending' },
    rejected: {
      label: 'Rejected',
      icon: <FiXCircle />,
      cls: 'status--rejected',
    },
  };

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
  // const formatDuration = (timeString) => {
  //   if (!timeString || timeString === '00:00:00') return '--';

  //   const [hours, minutes] = timeString.split(':').map(Number);

  //   if (hours === 0 && minutes === 0) return '--';

  //   if (hours === 0) {
  //     return `${minutes} min`;
  //   }

  //   if (minutes === 0) {
  //     return `${hours} hr`;
  //   }

  //   return `${hours} hr ${minutes} min`;
  // };

  /* ================= FETCH EMPLOYEES ================= */

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await fetch('https://hrms.mpdatahub.com/api/employee-List');
      const json = await res.json();

      if (json.success) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
    setLoadingEmployees(false);
  };

  /* ================= FETCH RAISE TICKET ================= */

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
    fetchEmployees();
  }, [activeForm, deleteId, dateFilter, updatingId]);

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

  /* ================= RAISE TICKET FORM SUBMIT ================= */

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
        'https://hrms.mpdatahub.com/api/ticket/create',
        {
          method: 'POST',
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Created successfully!');

        setFormData({
          user_id: '',
          date: '',
          type: '',
          time: '',
          reason: '',
        });
      } else {
        alert(
          'Failed to create Ticket: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  /* ================= UPDATE TICKET STATUS ================= */

  const handleStatusUpdate = async (id, status) => {
    const submitData = new FormData();
    submitData.append('id', id);
    submitData.append('status', status);

    if (updatingId) return;

    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://hrms.mpdatahub.com/api/ticket/status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Status Updated successfully!');
      } else {
        alert(
          'Failed to Update Ticket Status: ' +
            (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error Updating Ticket Status:', error);
      alert('Error Updating Ticket Status');
    } finally {
      setDeleteId(null);
      setUpdatingId(null);
    }
  };

  /* ================= TICKET DELETE ================= */

  const handleDelete = async (e) => {
    e.preventDefault();
    console.log(deleteId);
    const submitData = new FormData();
    submitData.append('id', deleteId);

    try {
      const response = await fetch(
        `https://hrms.mpdatahub.com/api/delete-Holida/${deleteId}`
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Deleted successfully!');
      } else {
        alert(
          'Failed to Delete Ticket: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error deleting Ticket:', error);
      alert('Error deleting Ticket');
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
          <IoAdd style={{ fontSize: '15px' }} /> Raise Ticket
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
                {/* EMP ID */}

                <div className="form-group">
                  <label>Employee</label>

                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {loadingEmployees ? 'Loading...' : 'Select Employee'}
                    </option>

                    {employees.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATE */}

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* CHECKIN/CHECKOUT */}

                <div className="form-group">
                  <label>Type</label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="clock_in">CheckIn</option>
                    <option value="clock_out">CheckOut</option>
                  </select>
                </div>

                {/* TIME */}

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* REASON */}

                <div className="form-group full-width">
                  <label>Reason</label>

                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* SUBMIT */}

                <div className="form-actions full-width">
                  <button type="submit" className="submit-btn">
                    {' '}
                    Raise Ticket{' '}
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
                {/* <th>Worked Hours</th> */}
                <th className="ll-txt-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {raiseTicket.length > 0 ? (
                raiseTicket.map((record) => {
                  const sc =
                    STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
                  const isUpdating = updatingId === record.id;

                  return (
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
                        <div className="status-flexs">
                          <span
                            className={`status-pills ${
                              record.status?.toLowerCase() === 'approved'
                                ? 'present'
                                : record.status?.toLowerCase() === 'rejected'
                                  ? 'absent'
                                  : 'pending'
                            }`}
                          >
                            {sc.icon} {sc.label}
                          </span>

                          {record.late_checkin === 1 && (
                            <span
                              className="late-indicators"
                              title={`Late by ${record.late_checkin_time}`}
                            >
                              Late
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WORKED HOURS */}
                      {/* <td>
                      <span className="hours-text">
                        {formatDuration(record.time)}
                      </span>
                    </td> */}

                      <td className="ll-txt-center">
                        {record.status === 'pending' ? (
                          <select
                            className="ll-status-dropdown"
                            value={record.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusUpdate(record.id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className="ll-status-fixed">
                            {' '}
                            {sc.icon} {sc.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
