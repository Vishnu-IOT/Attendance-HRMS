import React, { useEffect, useState } from "react";
import "../styles/EmpList.css";
import { FiEdit2, FiX, FiSave, FiSearch } from "react-icons/fi";
import Lottie from 'react-lottie';
import animationData from '../LottieFiles/Employee Search.json';

const API_URL = "https://hrms.mpdatahub.com/api/employee-List";
const UPDATE_URL = "https://hrms.mpdatahub.com/api/update-profile";

export default function EmpList() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  /* ---------------- FETCH EMPLOYEES ---------------- */

  const fetchEmployees = async () => {

    try {

      const res = await fetch(API_URL);
      const json = await res.json();

      if (json.success) {
        setEmployees(json.data);
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  /* ---------------- OPEN EDIT ---------------- */

  const openEdit = (emp) => {

    setEditData({
      id: emp.id,
      name: emp.name || "",
      empid: emp.empid || "",
      email: emp.email || "",
      mobile: emp.mobile || "",
      position: emp.position || "",
      address: emp.address || "",
      dob: emp.dob || ""
    });

    setEditModal(true);
  };

  /* ---------------- INPUT CHANGE ---------------- */

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------------- SAVE EDIT ---------------- */

  const saveEdit = async () => {

    if (!editData?.id) {
      setSaveError("ID missing");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {

      const formData = new FormData();

      formData.append("id", editData.id);

      // only send changed fields
      if (editData.name) formData.append("name", editData.name);
      if (editData.empid) formData.append("empid", editData.empid);
      if (editData.email) formData.append("email", editData.email);
      if (editData.mobile) formData.append("mobile", editData.mobile);
      if (editData.position) formData.append("position", editData.position);
      if (editData.address) formData.append("address", editData.address);
      if (editData.dob) formData.append("dob", editData.dob);



      const res = await fetch(UPDATE_URL, {
        method: "POST",
        body: formData
      });

      const json = await res.json();

      console.log("API Response:", json);

      if (json.success) {

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editData.id ? { ...emp, ...editData } : emp
          )
        );

        setEditModal(false);

      } else {
        setSaveError(json.message || "Update failed");
      }
    } catch {
      setSaveError("Network error");
    }
    setSaving(false);
  };
  /* ---------------- SEARCH ---------------- */
  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  /* ---------------- UI ---------------- */
  return (

    <div className="emplist-page">

      {/* HEADER */}

      <div className="emplist-header">

        <div className="emplist-title">
          <Lottie options={defaultOptions} height={90} width={70} />
          <div>
            <h1>Employee List</h1>
            <p>{employees.length} employees</p>
          </div>
        </div>

        <div className="emplist-search-wrap">
          <FiSearch className="search-icon" />
          <input className="emplist-search" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {/* EMPLOYEE GRID */}

      <div className="emp-grid">

        {filtered.map((emp) => (

          <div className="emp-card" key={emp.id}>

            <div className="emp-card-top">

              <img src={emp.profile_img} alt={emp.name} className="emp-avatar" />
              <div className="emp-badge">{emp.empid}</div>

            </div>

            <div className="emp-card-body">

              <h3>{emp.name}</h3>

              <span className="emp-position">
                {emp.position || "N/A"}
              </span>

              <p><strong>Email:</strong> {emp.email}</p>
              <p><strong>Phone:</strong> {emp.mobile}</p>
              <p><strong>DOB:</strong> {emp.dob || "N/A"}</p>
              <p><strong>Address:</strong> {emp.address}</p>

            </div>

            <div className="emp-card-actions">

              <button
                className="btn-edit"
                onClick={() => openEdit(emp)}
              >
                <FiEdit2 /> Edit
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* EDIT MODAL */}

      {editModal && (

        <div className="modal-overlay">

          <div className="modal-box">

            <div className="modal-header">

              <h2>Edit Employee</h2>

              <button
                className="modal-close"
                onClick={() => setEditModal(false)}
              >
                <FiX />
              </button>

            </div>

            {saveError && (
              <div className="modal-api-error">
                {saveError}
              </div>
            )}

            <div className="modal-form">

              <input name="name" value={editData.name} onChange={handleEditChange} />
              <input name="empid" value={editData.empid} onChange={handleEditChange} />
              <input name="email" value={editData.email} onChange={handleEditChange} />
              <input name="mobile" value={editData.mobile} onChange={handleEditChange} />
              <input name="position" value={editData.position} onChange={handleEditChange} />
              <input type="date" name="dob" value={editData.dob} onChange={handleEditChange} />
              <input name="address" value={editData.address} onChange={handleEditChange} />

            </div>

            <div className="modal-footer">

              <button
                className="btn-cancel"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? "Saving..." : <><FiSave /> Save</>}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}