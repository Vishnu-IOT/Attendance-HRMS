import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Completing Tasks.json';
import { IoAdd } from 'react-icons/io5';
import { MdDeleteOutline } from 'react-icons/md';
import { FaRegBell } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const Notification = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    desc: '',
  });

  const [notifications, setNotification] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  /* ================= FETCH NOTIFICATION ================= */

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(
          'https://hrms.mpdatahub.com/api/notifications'
        );
        const result = await response.json();
        if (result.success) {
          setNotification(result.data);
        }
      } catch (error) {
        console.error('Error fetching Notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [activeForm, deleteId]);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
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
        <p>Loading Notification records...</p>
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
              <h1>Notification Records</h1>
              <p>
                Centralize notification creation and ensure timely communication
                of meetings and key events across your organization.
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
          <IoAdd style={{ fontSize: '15px' }} /> Add Notifications
        </button>
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
              <h2 className="form-title">Notification Creator</h2>

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
                    Add Notification{' '}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <h2 className="form-title">Scheduled Notifications</h2>
      <div className="card-container">
        {notifications.length === 0 ? (
          <div className="ll-center">
            <p>No Permission records found matching your criteria.</p>
          </div>
        ) : (
          notifications.map((data) => (
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
                <span className="date">{data.type}</span>
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

export default Notification;
