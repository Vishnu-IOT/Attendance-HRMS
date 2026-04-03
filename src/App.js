import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import RegistrationForm from './pages/RegistrationForm';
import AttendanceList from './pages/AttendanceList';
import EmpList from './pages/EmpList';
import LeaveList from './pages/LeaveList';
import PermissionList from './pages/PermissionList';
import './styles/App.css';
import HolidayForm from './pages/HolidayForm';
import Notification from './pages/Notification';
import CompanyDetails from './pages/CompanyDetails';
import RaiseTicket from './pages/RaiseTicket';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="add-employee" element={<RegistrationForm />} />
            <Route path="emp-list" element={<EmpList />} />
            <Route path="leave-list" element={<LeaveList />} />
            <Route path="permission-list" element={<PermissionList />} />
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="add-holiday" element={<HolidayForm />} />
            <Route path="add-notification" element={<Notification />} />
            <Route path="add-company" element={<CompanyDetails />} />
            <Route path="raise-ticket" element={<RaiseTicket />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
