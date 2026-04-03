import React, { useState, useEffect } from 'react';
import '../styles/HolidayForm.css';
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Completing Tasks.json';
import { IoAdd } from 'react-icons/io5';
import { MdDeleteOutline } from 'react-icons/md';
import { FaRegBell } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const HolidayForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    holiday_date: '',
    description: '',
  });

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = now.getFullYear();

  const [dateFilter, setDateFilter] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const [holidays, setHolidays] = useState([]);
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

  /* ================= FETCH HOLIDAY ================= */

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://hrms.mpdatahub.com/api/holiday/list?month=${dateFilter.month}&year=${dateFilter.year}`
        );
        const result = await response.json();
        if (result.success) {
          setHolidays(result.data);
        }
      } catch (error) {
        console.error('Error fetching Holidays:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
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

  /* ================= HOLIDAY FORM SUBMIT ================= */

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
        'https://hrms.mpdatahub.com/api/holiday/create',
        {
          method: 'POST',
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Holiday Created successfully!');

        setFormData({
          title: '',
          holiday_date: '',
          description: '',
        });
      } else {
        alert(
          'Failed to create Holiday: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  /* ================= HOLIDAY DELETE ================= */

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
        alert(result.message || 'Holiday Deleted successfully!');
      } else {
        alert(
          'Failed to Delete Holiday: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('Error deleting holiday');
    } finally {
      setDeleteId(null);
    }
  };

  /* ================= HOLIDAY NOTIFICATION ================= */

  const handleNotification = async (e) => {
    e.preventDefault();
    console.log(notificationId);
    const submitData = new FormData();
    submitData.append('id', notificationId);

    try {
      const response = await fetch(
        `https://hrms.mpdatahub.com/api/send-holiday-notification`,
        {
          method: 'POST',
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        alert(result.message || 'Holiday Notification Send successfully!');
      } else {
        alert(
          'Failed to Send Holiday Notification: ' +
            (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error in sending holiday notification:', error);
      alert('Error sending holiday notificaiton');
    } finally {
      setNotificationId(null);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="attendance-page loading-container">
        <div className="loader-pulse"></div>
        <p>Loading Holiday records...</p>
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
              <h1>Holiday Records</h1>
              <p>
                Centralize and manage all holiday schedules and special
                occasions across your organization.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="toggle-button">
        <button
          className="toggle-btn"
          onClick={() => setActiveForm((prev) => !prev)}
        >
          <IoAdd style={{ fontSize: '15px' }} /> Add Holiday
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
              <h2 className="form-title">Holiday Planner</h2>

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

                {/* HOLIDAY DATE */}

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="holiday_date"
                    value={formData.holiday_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="form-group full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* SUBMIT */}

                <div className="form-actions full-width">
                  <button type="submit" className="submit-btn">
                    {' '}
                    Add Holiday{' '}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <h2 className="form-title">List of Holiday</h2>
      {}
      <div className="card-container">
        {holidays.length === 0 ? (
          <div className="ll-center">
            <p>No Holidays records found matching your Filterations.</p>
          </div>
        ) : (
          holidays.map((data) => (
            <div className="holiday-card" key={data.id}>
              <div className="toggle-button">
                <button
                  className="delete-icon"
                  onClick={() => setNotificationId(data.id)}
                >
                  <FaRegBell style={{ color: '#5355E0' }} />
                </button>
                <button
                  className="delete-icon"
                  onClick={() => setDeleteId(data.id)}
                >
                  <MdDeleteOutline
                    style={{ fontSize: '23px', color: '#c62828' }}
                  />
                </button>
              </div>
              <div className="card-header">
                <h3>{data.title}</h3>
                <span className="date">{data.holiday_date}</span>
              </div>
              <p className="description">{data.description}</p>
            </div>
          ))
        )}
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

              <h2 className="form-title">Delete Holiday</h2>

              <p className="confirm-text">
                Are you sure you want to delete this holiday?
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

              <h2 className="form-title">Send Holiday Notification</h2>

              <p className="confirm-text">
                Are you sure you want to send holiday notification?
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

export default HolidayForm;
