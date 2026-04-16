import React, { useState, useEffect } from 'react';
import '../styles/AttendanceList.css';
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Completing Tasks.json';

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  const [dateFilter, setDateFilter] = useState(now.toISOString().split('T')[0]);

  const handleDate = (e) => {
    const { value } = e.target;
    setDateFilter(value);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `https://hrms.mpdatahub.com/api/attendance-list?date=${dateFilter}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setAttendanceData(result.data);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [dateFilter]);

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

  if (loading) {
    return (
      <div className="attendance-page loading-container">
        <div className="loader-pulse"></div>
        <p>Loading attendance records...</p>
      </div>
    );
  }

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

  return (
    <div className="attendance-page fade-in-up">
      {/* HEADER */}
      <div className="page-header glass-panel">
        <div className="header-content">
          <div className="permission-title-group">
            <Lottie options={defaultOptions} height={70} width={70} />
            <div>
              <h1>Attendance Records</h1>
              <p>Track and manage employee daily presence and work hours.</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="stat-badge">
              <span className="badge-label">Monthly Records</span>
              <span className="badge-value">{attendanceData.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: 'flex', width: '100%', gap: '30px', padding: '10px' }}
      >
        <div className="form-group">
          <label>Date Filter</label>
          <input
            type="date"
            name="attendance_date"
            value={dateFilter}
            onChange={handleDate}
            required
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="attendance-content glass-panel">
        <div className="table-responsive">
          <table className="elegant-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Late By</th>
                <th>Worked Hours</th>
                <th>Shortfall / Overtime</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record) => (
                  <tr key={record.id} className="table-row">
                    {/* EMPLOYEE */}
                    <td>
                      <div className="employee-cell">
                        <div className="avatar-circle">
                          {getInitials(record.name)}
                        </div>

                        <span className="employee-name">{record.name}</span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td>{formatDate(record.attendance_date)}</td>

                    {/* CHECK IN */}
                    <td>
                      <div className="time-badge in">
                        {record.type === 'ABSENT'
                          ? '--'
                          : formatTime(record.check_in)}
                      </div>
                    </td>

                    {/* CHECK OUT */}
                    <td>
                      <div className="time-badge out">
                        {record.type === 'ABSENT'
                          ? '--'
                          : formatTime(record.check_out)}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      <div className="status-flex">
                        <span
                          className={`status-pill ${record.type?.toLowerCase() === 'present'
                            ? 'present'
                            : 'absent'
                            }`}
                        >
                          {record.type || 'N/A'}
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
                    <td>
                      {record.late_checkin === 1
                        ? formatDuration(record.late_checkin_time)
                        : '--'}
                    </td>

                    {/* WORKED HOURS */}
                    <td>
                      <span className="hours-text">
                        {formatDuration(record.worked_hours)}
                      </span>
                    </td>

                    {/* SHORTFALL / OVERTIME */}
                    <td>
                      <span className="hours-text">
                        {formatDuration(record.overtimed_hours)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;
